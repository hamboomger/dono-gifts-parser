import 'module-alias/register'
import 'reflect-metadata'
import 'express-async-errors'
import 'dotenv/config'

import { Container } from 'typedi'

import { getServer } from '@/server'
import { AppConfigService } from '@/common/AppConfigService'
import { initFirebaseAdmin } from '@/common/config/firebase-admin.config'

async function bootstrap() {
  initFirebaseAdmin()

  const server = getServer()
  const config = Container.get(AppConfigService)

  const port = config.env.PORT || 3000
  server.listen(port, () => {
    console.log(`Server started on port ${port}`)
  })
}
bootstrap()
