import { Request, RequestHandler } from 'express'
import _ from 'lodash'

const REQUEST_ID_LENGTH = 5

const bigChars = _.range(26).map((i) => String.fromCharCode(65 + i))
const smallChars = _.range(26).map((i) => String.fromCharCode(97 + i))
const numbers = _.range(10)
const totalCharactersPool = [...numbers, ...bigChars, ...smallChars, ...numbers]

export const addRequestId: RequestHandler = (req, res, next) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  req.appRequestId = _.range(REQUEST_ID_LENGTH)
    .map(() => totalCharactersPool[_.random(totalCharactersPool.length - 1)])
    .join('')

  next()
}

export function getRequestId(req: Request<any, any, any, any>): string {
  // eslint-disable-next-line
  // @ts-expect-error
  return req.appRequestId!
}
