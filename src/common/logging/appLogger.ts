import { Request } from 'express'
import { Container } from 'typedi'

import { getRequestId } from '@/common/middleware/addRequestId'
import { AppConfigService } from '@/common/AppConfigService'
import { getLogdnaLogger } from '@/common/logging/logdna'
import {winstonLogger} from "@/common/logging/winston";

type ErrorType = 'server' | 'client' | 'unexpected'

export interface LogMetadata {
  url?: string
  reqBody?: string
  userId?: string
  userEmail?: string
  [field: string]: any
}

export interface LogErrorMetadata extends LogMetadata {
  errorType: ErrorType
}

export interface LogEntry<
  T extends LogMetadata = LogMetadata | LogErrorMetadata,
> {
  message: string
  meta?: T
  level?: string
  error?: any
}

export function createLogMetadata(
  req: Request<any, any, any, any>,
): LogMetadata {
  return {
    url: req.url,
    requestId: getRequestId(req),
    reqBody: JSON.stringify(req.body, null, 2),
    userId: req.user?.uid,
    userEmail: req.user?.email,
  }
}

function _log(logEntry: LogEntry) {
  const config = Container.get(AppConfigService)

  const { message, meta, level, error } = logEntry

  if (config.env.SEND_LOGS) {
    getLogdnaLogger().log(
      {
        message,
        meta: {
          ...meta,
          ...(error
            ? {
                error: serializeError(error),
              }
            : {}),
        },
      },
      { level },
    )
  } else {
    winstonLogger.log({
      level: level ?? 'info',
      message,
      error,
      stack: error?.stack ?? undefined,
    })
  }
}

const serializeError = (error: any): any => ({
  name: error.name,
  message: error.message,
  stack: error.stack,
  ...(error.cause
    ? {
        cause: {
          name: error.cause.name,
          message: error.cause.message,
          stack: error.cause.stack,
        },
      }
    : {}),
})

export const appLogger = {
  debug: (logEntry: LogEntry) =>
    _log({
      ...logEntry,
      level: 'debug',
    }),
  info: (logEntry: LogEntry) =>
    _log({
      ...logEntry,
      level: 'info',
    }),
  warn: (logEntry: LogEntry) =>
    _log({
      ...logEntry,
      level: 'warn',
    }),
  error: (logEntry: LogEntry<LogErrorMetadata>) =>
    _log({
      ...logEntry,
      level: 'error',
    }),
  log: (logEntry: LogEntry) => _log(logEntry),
}
