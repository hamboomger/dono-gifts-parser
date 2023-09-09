import express, { Express } from 'express'
import * as swaggerUi from 'swagger-ui-express'
import { Container } from 'typedi'
import bodyParser from 'body-parser'

import { addRequestId } from '@/common/middleware/addRequestId'
import { AppConfigService } from '@/common/AppConfigService'
import { apiDocs } from '@/apiDocs'
import testAuthMiddleware from '@/common/middleware/testAuth'
import { authMiddleware } from '@/common/middleware/auth'
import { usersRoute } from '@/user/routes/usersRoute'
import {
  handleFlareErrors,
  handleOtherErrors,
} from '@/common/middleware/errors'

export function getServer(): Express {
  const app = express()
  const config = Container.get(AppConfigService)

  app.use(addRequestId)
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())

  if (config.env.DEPLOY_SWAGGER_DOC_ROUTE) {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(apiDocs))
  }

  app.use(authMiddleware)
  app.use(testAuthMiddleware)

  app.use(usersRoute())

  app.use(handleFlareErrors)
  app.use(handleOtherErrors)

  return app
}
