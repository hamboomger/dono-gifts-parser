import express, { Express } from 'express'
import * as swaggerUi from 'swagger-ui-express'
import { Container } from 'typedi'
import bodyParser from 'body-parser'

import { addRequestId } from '@/common/middleware/addRequestId'
import { AppConfigService } from '@/common/AppConfigService'
import { apiDocs } from '@/apiDocs'
import testAuthMiddleware from '@/common/middleware/testAuth'
import { authMiddleware } from '@/common/middleware/auth'
import {
  handleFlareErrors,
  handleOtherErrors,
} from '@/common/middleware/errors'
import { giftsRoute } from '@/parsing/routes/giftsRoute'

export function getServer(): Express {
  const app = express()
  const config = Container.get(AppConfigService)

  app.use(addRequestId)
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())

  if (config.env.DEPLOY_SWAGGER_DOC_ROUTE) {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(apiDocs))
  }

  if (config.env.USE_TEST_AUTH) {
    app.use(testAuthMiddleware)
  } else {
    app.use(authMiddleware)
  }

  app.use(giftsRoute())

  app.use(handleFlareErrors)
  app.use(handleOtherErrors)

  return app
}
