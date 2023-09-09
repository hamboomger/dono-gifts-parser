import { Service } from 'typedi'

import { prisma } from '@/common/config/prisma.config'
import { userMapper } from '@/user/dto/userMapper'
import { CreateUserDto } from '@/user/dto/createUser.dto'
import { ViewUserDto } from '@/user/dto/viewUser.dto'

@Service()
export class UsersService {
  async createUser(user: CreateUserDto): Promise<ViewUserDto> {
    const userModel = await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
      },
    })

    return userMapper.modelToView(userModel)
  }

  async getUsers(): Promise<ViewUserDto[]> {
    const users = await prisma.user.findMany({
      orderBy: { name: 'desc' },
    })
    return users.map(userMapper.modelToView)
  }
}
