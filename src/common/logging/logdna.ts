import logdna from '@logdna/logger'
import { Response } from 'express'
import { once } from 'events'
import { Container } from 'typedi'

import { AppConfigService } from '@/common/AppConfigService'
import { appLogger, createLogMetadata } from '@/common/logging/appLogger'

let _logger: logdna.Logger

export const getLogdnaLogger = () => {
  const config = Container.get(AppConfigService)
  const options: logdna.ConstructorOptions = {
    app: config.env.LOGDNA_APP_NAME,
    maxBackoffMs: 4000,
    indexMeta: true,
    level: 'info',
  }

  const ingestionKey = config.env.LOGDNA_INGESTION_KEY
  if (!ingestionKey) {
    throw Error('Provide ingestion key in order to use logdna logger')
  }
  if (!_logger) {
    _logger = logdna.createLogger(ingestionKey, options)
  }
  return _logger
}

export async function flushLogdnaLogger() {
  const logdnaLogger = getLogdnaLogger()
  logdnaLogger.flush()
  await once(logdnaLogger, 'cleared')
}

function logRequest(res: Response, resBody?: any) {
  const req = res.req
  if (!req) return

  appLogger.debug({
    message: `Request to ${req.url}, res: ${res.statusCode}`,
    meta: {
      ...createLogMetadata(req),
      resBody: resBody ? formatResBody(resBody) : undefined,
    },
  })
}

export const sendJson = async <T = any>(
  res: Response<T>,
  json: T,
): Promise<void> => {
  const config = Container.get(AppConfigService)

  if (config.env.LOG_REQUESTS) {
    logRequest(res, json)
  }
  flushLogdnaLogger().catch((err) =>
    console.error('Failed to flush logger data: ', err),
  )
  res.json(json)
}

export const sendStatus = async <T = any>(
  res: Response,
  status: number,
): Promise<void> => {
  await flushLogdnaLogger()
  res.sendStatus(status)
}

function formatResBody(resBody: Record<string, any>): string {
  const fieldsToHide = ['imageUrl', 'imagesUrls', 'imageUrls', 'imagesUrl']
  const hideImageUrlFields = (
    obj: Record<string, any>,
  ): Record<string, any> => {
    const entries = Object.entries(obj)
    const fields = entries.map(([k, v]) => {
      if (fieldsToHide.includes(k)) {
        return { [k]: '...' }
      }
      if (typeof v === 'object' && !Array.isArray(v) && v !== null) {
        return { [k]: hideImageUrlFields(v) }
      } else {
        return { [k]: v }
      }
    })
    return Object.assign({}, ...Array.from(fields))
  }

  return JSON.stringify(hideImageUrlFields(resBody), null, 2)
}
