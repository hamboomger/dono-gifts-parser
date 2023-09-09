import { Fls } from '@flares/pascal-case-code-flares/dist'
import { RequestHandler } from 'express'

export const TEST_UID_HEADER_PARAM = 'TEST_UID'
export const TEST_EMAIL_HEADER_PARAM = 'TEST_EMAIL'

const testAuthMiddleware: RequestHandler = async (req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    next()
    return
  }

  const testUid = req.header(TEST_UID_HEADER_PARAM)
  const testEmail = req.header(TEST_EMAIL_HEADER_PARAM)
  if (testUid === undefined || testEmail === undefined) {
    throw Fls.Unauthorized401(
      `${TEST_UID_HEADER_PARAM} and/or ${TEST_EMAIL_HEADER_PARAM} are not provided in the request headers`
    )
  }
  req.user = {
    uid: testUid,
    email: testEmail
  }
  next()
}

export default testAuthMiddleware
