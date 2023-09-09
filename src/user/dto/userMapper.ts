// import { User } from '@prisma/client'

import { ViewUserDto } from '@/user/dto/viewUser.dto'

export const userMapper = {
  modelToView: (user: any): ViewUserDto => ({
    name: user.name ?? undefined,
    email: user.email,
  }),
}
