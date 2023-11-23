import { Service } from 'typedi'
import { z } from 'zod'

import { zfdTypes } from '@/common/utils/zodUtils'

const schema = z.object({
  PORT: zfdTypes.number().optional(),
  SERVER_API_KEY: z.string(),
  DEPLOY_SWAGGER_DOC_ROUTE: zfdTypes.boolean().default('0'),
  SEND_LOGS: zfdTypes.boolean().default('0'),
  LOG_REQUESTS: zfdTypes.boolean().default('0'),
  IS_LOCAL: zfdTypes.boolean().default('0'),
  USE_TEST_AUTH: zfdTypes.boolean().default('0'),
  BRIGHT_DATA_PASSWORD: z.string(),
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
