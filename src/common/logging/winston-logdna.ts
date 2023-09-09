import Transport from 'winston-transport'
import os from 'os'
import { LogEntry } from 'winston'
import { Container } from 'typedi'

import axiosAgent from '../config/axios.config'
import { AppConfigService } from '@/common/AppConfigService'

const LOGDNA_ENDPOINT = 'https://logs.logdna.com/logs/ingest'

export class WinstonLogdnaEndpointTransport extends Transport {
  log(info: LogEntry, next: () => void): any {
    const config = Container.get(AppConfigService)
    setImmediate(() => {
      this.emit('logged', info)
    })

    const { error } = info

    axiosAgent
      .post(
        LOGDNA_ENDPOINT,
        {
          lines: [
            {
              timestamp: Date.now(),
              line: info.message,
              app: config.env.LOGDNA_APP_NAME,
              level: info.level,
              meta: {
                ...info.meta,
                ...(error
                  ? {
                      error: {
                        name: error.name,
                        message: error.message,
                        stack: error.stack,
                      },
                    }
                  : {}),
              },
            },
          ],
        },
        {
          params: {
            hostname: os.hostname(),
            now: Date.now(),
            apikey: config.env.LOGDNA_INGESTION_KEY,
          },
        },
      )
      .then(() => {
        next()
      })
      .catch((err) => {
        console.error('Failed to send logs to LogDNA Platform', err)
      })
  }
}
