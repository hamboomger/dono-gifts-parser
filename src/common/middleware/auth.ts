import { Request, RequestHandler } from 'express'
import admin from 'firebase-admin'
import { Fls } from '@flares/pascal-case-code-flares/dist'
import {Container} from "typedi";
import {AppConfigService} from "@/common/AppConfigService";

interface UserData {
  uid: string
  email?: string
}

export const authMiddleware: RequestHandler = async (req, res, next) => {
  const appConfig = Container.get(AppConfigService)
  const authToken = req.get('authorization')
  if (authToken !== appConfig.env.SERVER_API_KEY) {
    console.error('Failed to verify user by token')
    throw Fls.Forbidden403('Failed to verify user by token')
  }
  next()
}

export function getUser(req: Request<any, any, any, any>): UserData {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return req.user!
}
