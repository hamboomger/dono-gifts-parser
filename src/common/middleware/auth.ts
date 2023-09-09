import { Request, RequestHandler } from 'express'
import admin from 'firebase-admin'
import { Fls } from '@flares/pascal-case-code-flares/dist'
import {appLogger} from "@/common/logging/appLogger";

interface UserData {
  uid: string
  email?: string
}

export const authMiddleware: RequestHandler = async (req, res, next) => {
  if (process.env.NODE_ENV === 'test') {
    next()
    return
  }
  const authToken = req.get('authorization')
  try {
    const token = await admin.auth().verifyIdToken(authToken as string)
    const user = await admin.auth().getUser(token.uid)
    req.user = {
      uid: user.uid,
      email: user.email ?? 'none',
    }
    next()
  } catch (e) {
    appLogger.error({ message: 'Failed to verify user by token', error: e })
    throw Fls.Forbidden403('Failed to verify user by token')
  }
}

export function getUser(req: Request<any, any, any, any>): UserData {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return req.user!
}
