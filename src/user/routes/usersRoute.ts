import { Router } from 'express'
import { Container } from 'typedi'

import { withSchema } from '@/common/middleware/withSchema'
import { createUserSchema, getUsersSchema } from '@/user/routes/schema'
import { getUser } from '@/common/middleware/auth'
import { UsersService } from '@/user/services/UsersService'

export function usersRoute(): Router {
  const router = Router()

  const usersService = Container.get(UsersService)

  router.post(
    '/users/create',
    withSchema(createUserSchema),
    async (req, res) => {
      const { uid } = getUser(req)

      const createdUser = await usersService.createUser(req.body)
      res.json(createdUser)
    },
  )

  router.get('/users', withSchema(getUsersSchema), async (req, res) => {
    const users = await usersService.getUsers()
    res.json(users)
  })

  return router
}
