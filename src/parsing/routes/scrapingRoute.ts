import { Router } from 'express'
import { Container } from 'typedi'
import { Page } from 'puppeteer'

import { PuppeteerService } from '@/parsing/PuppeteerService'

export function scrapingRoute(): Router {
  const router = Router()

  const puppeteerService = Container.get(PuppeteerService)

  router.get('/scrape-url', async (req, res) => {
    const { url } = req.query as { url: string }

    const browser = await puppeteerService.getBrowser()
    const page = await browser.newPage()
    await cancelImagesDownload(page)

    await page.setUserAgent(
      'Mozilla/5.0 (Linux; Android 13; Pixel 6a) AppleWebKit/537.36 (KHTML, like Gecko)' +
        ' Chrome/112.0.0.0 Mobile Safari/537.36',
    )
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en;q=0.8, *;q=0.5',
    })

    await page.goto(url, {
      waitUntil: 'domcontentloaded',
    })
    const html = await page.content()
    page.close()

    res.contentType('html')
    res.send(html)
  })

  return router
}

async function cancelImagesDownload(page: Page) {
  // Enable request interception
  await page.setRequestInterception(true)

  // Listen for requests
  page.on('request', (request) => {
    if (request.resourceType() === 'image') {
      // If the request is for an image, block it
      request.abort()
    } else {
      // If it's not an image request, allow it to continue
      request.continue()
    }
  })
}
