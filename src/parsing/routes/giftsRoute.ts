import { Router } from 'express'
import { Container } from 'typedi'
import { Fls } from '@flares/pascal-case-code-flares'

import { GiftsScrapingService } from '@/parsing/GiftsScrapingService'
import { withSchema } from '@/common/middleware/withSchema'
import { parseGiftFromPageSchema } from '@/parsing/routes/giftsRoute.schema'
import { sendJson } from '@/common/logging/logdna'

export function giftsRoute(): Router {
  const router = Router()

  const giftScraper = Container.get(GiftsScrapingService)

  router.get(
    '/parse-gift-from-page',
    withSchema(parseGiftFromPageSchema),
    async (req, res) => {
      const { url } = req.query

      const parsedGift = await giftScraper.parseGiftByUrl(url)
      if (!parsedGift) {
        throw Fls.BadRequest400('Failed to parse gift by url')
      }

      await sendJson(res, parsedGift)
    },
  )

  return router
}
