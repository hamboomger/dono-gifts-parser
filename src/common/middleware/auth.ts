import { Request, RequestHandler } from 'express'
import admin from 'firebase-admin'
import { Fls } from '@flares/pascal-case-code-flares/dist'
import { Container } from 'typedi'
import * as crypto from 'crypto'

import { AppConfigService } from '@/common/AppConfigService'

interface UserData {
  uid: string
  email?: string
}

export const authMiddleware: RequestHandler = async (req, res, next) => {
  const appConfig = Container.get(AppConfigService)
  if (!req.header('Authorization') || !req.header('CURRENT_TIME')) {
    throw Fls.Unauthorized401('Authorization & CURRENT_TIME header required')
  }

  const signedTime = req.header('Authorization')!
  const currentTime = req.header('CURRENT_TIME')!

  const locallySignedTime = crypto
    .createHmac('sha256', appConfig.env.SERVER_API_KEY)
    .update(currentTime)
    .digest('hex')

  if (locallySignedTime !== signedTime) {
    throw Fls.Forbidden403('Invalid Authorization header')
  }

  next()
}

export function getUser(req: Request<any, any, any, any>): UserData {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return req.user!
}
