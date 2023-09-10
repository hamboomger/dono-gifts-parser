import { OpenAPIV3 } from 'openapi-types'

import { version, name } from '../package.json'
import { giftsRouteApiDocs } from '@/parsing/routes/giftsRoute.docs'

export const apiDocs: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    version,
    title: `${name} server api`,
  },
  paths: {
    ...giftsRouteApiDocs,
  },
}
