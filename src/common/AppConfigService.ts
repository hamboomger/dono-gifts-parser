import { Service } from 'typedi'
import { z } from 'zod'

import { zfdTypes } from '@/common/utils/zodUtils'
import { appLogger } from '@/common/logging/appLogger'

const schema = z.object({
  PORT: zfdTypes.number().optional(),
  DATABASE_URL: z.string(),
  DEPLOY_SWAGGER_DOC_ROUTE: zfdTypes.boolean().default('0'),
  SEND_LOGS: zfdTypes.boolean().default('0'),
  LOG_REQUESTS: zfdTypes.boolean().default('0'),
  IS_LOCAL: zfdTypes.boolean(),
  LOGDNA_APP_NAME: z.string(),
  LOGDNA_INGESTION_KEY: z.string(),
})

@Service()
export class AppConfigService {
  public env: z.infer<typeof schema>
  constructor() {
    const result = schema.safeParse(process.env)
    if (result.success) {
      this.env = result.data
    } else {
      console.error(
        'FATAL ERROR: Environment variables validation failed:',
        result.error.issues,
      )
      process.exit(1)
    }
    // this.env = schema(process.env)
  }
}
