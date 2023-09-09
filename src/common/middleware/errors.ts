import _ from 'lodash'
import { ErrorRequestHandler, Request } from 'express'
import { AnyFlare, isFlare } from '@flares/core/dist/flare/flare'
import { Container } from 'typedi'

import { getRequestId } from '@/common/middleware/addRequestId'
import {
  appLogger,
  createLogMetadata,
  LogErrorMetadata,
} from '@/common/logging/appLogger'
import { flushLogdnaLogger } from '@/common/logging/logdna'
import { AppConfigService } from '@/common/AppConfigService'

export interface HttpError {
  requestId: string
  date: string
  name: string
  code: number
  message: string
}

export function getErrorDate(): string {
  const date = new Date()

  return date
    .toLocaleDateString('en', {
      year: 'numeric',
      month: '2-digit',
      day: 'numeric',
      hour: '2-digit',
    })
    .replace(/\//g, '.')
}

export const handleFlareErrors: ErrorRequestHandler = async (
  err,
  req,
  res,
  next,
) => {
  if (isFlare(err)) {
    logFlareError(err, req)

    const response: HttpError = {
      requestId: getRequestId(req),
      date: getErrorDate(),
      code: err.statusCode,
      message: err.message ?? err.statusText,
      name: err.statusText,
      ...(Object.keys(err.data).length > 0 ? { data: err.data } : {}),
    }
    res.status(err.statusCode)
    res.json(response)
  } else {
    next(err)
  }
}

// noinspection JSUnusedLocalSymbols
export const handleOtherErrors: ErrorRequestHandler = async (
  err,
  req,
  res,
  next,
) => {
  appLogger.error({
    message: `Internal server error: ${err.message}`,
    error: err,
    meta: {
      ...createLogMetadata(req),
      errorType: 'unexpected',
    },
  })
  flushLogdnaLogger()

  const response: HttpError = {
    requestId: getRequestId(req),
    date: getErrorDate(),
    name: 'Internal server error',
    code: 500,
    message: 'Server-side error happened',
  }
  res.status(500)
  res.json(response)
}

function logFlareError(flare: AnyFlare, req: Request) {
  const errorType = _.inRange(flare.statusCode, 400, 500) ? 'client' : 'server'

  const logMetadata: LogErrorMetadata = {
    ...createLogMetadata(req),
    errorType,
  }

  appLogger.log({
    message: `Error occurred: ${formatFlareError(flare)}`,
    meta: logMetadata,
    error: flare,
    level: errorType === 'client' ? 'info' : 'error',
  })
}

function formatFlareError(err: AnyFlare): string {
  const config = Container.get(AppConfigService)
  let result = `[${err.statusCode}] ${err.message}`
  if (err.cause && config.env.IS_LOCAL) {
    result += `\nCaused by: ${err.cause.message}`
  }
  return result
}
