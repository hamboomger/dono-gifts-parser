import express, { Express } from 'express'
import { Container } from 'typedi'
import bodyParser from 'body-parser'

import { addRequestId } from '@/common/middleware/addRequestId'
import { AppConfigService } from '@/common/AppConfigService'
import testAuthMiddleware from '@/common/middleware/testAuth'
import { authMiddleware } from '@/common/middleware/auth'
import { scrapingRoute } from '@/parsing/routes/scrapingRoute'

export function getServer(): Express {
  const app = express()
  const config = Container.get(AppConfigService)

  app.use(addRequestId)
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())

  if (config.env.USE_TEST_AUTH) {
    app.use(testAuthMiddleware)
  } else {
    app.use(authMiddleware)
  }

  app.use(scrapingRoute())

  return app
}
