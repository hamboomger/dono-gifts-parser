import 'module-alias/register'
import 'reflect-metadata'
import 'express-async-errors'

import { Container } from 'typedi'

import { getServer } from '@/server'
import { AppConfigService } from '@/common/AppConfigService'
import { appLogger } from '@/common/logging/appLogger'
import { initFirebaseAdmin } from '@/common/config/firebase-admin.config'

async function bootstrap() {
  initFirebaseAdmin()

  const server = getServer()
  const config = Container.get(AppConfigService)

  const port = config.env.PORT || 3000
  server.listen(port, () => {
    appLogger.info({ message: `Server started on port ${port}` })
  })
}
bootstrap()
