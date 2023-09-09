import { OpenAPIV3 } from 'openapi-types'

import { version, name } from '../package.json'
import { usersRouteApi } from '@/user/routes/usersRoute.api'

export const apiDocs: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    version,
    title: `${name} server api`,
  },
  paths: {
    ...usersRouteApi,
  },
}
