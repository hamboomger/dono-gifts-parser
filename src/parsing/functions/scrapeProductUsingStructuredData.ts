import puppeteer from 'puppeteer'

import { ParsedGift } from '@/parsing/dto/ParsedGift.dto'
import { appLogger } from '@/common/logging/appLogger'

interface ProductPrice {
  amount: number
  currency: string
}

export async function scrapeProductUsingStructuredData(
  url: string,
): Promise<ParsedGift | undefined> {
  try {
    return scrapeIt(url)
  } catch (error) {
    appLogger.error({
      message: `Failed to parse product by url: ${url}`,
      error,
    })
    return undefined
  }
}

async function scrapeIt(url: string): Promise<ParsedGift | undefined> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-gpu'],
    executablePath: '/usr/bin/google-chrome',
  })
  const page = await browser.newPage()

  const schemaSelector = 'script[type="application/ld+json"]'
  await page.goto(url, {
    waitUntil: 'domcontentloaded',
  })

  // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error,@typescript-eslint/ban-ts-comment
  // @ts-ignore
  const productSchema = await page.$$eval(schemaSelector, (scripts) => {
    for (const script of scripts) {
      const schema = JSON.parse(script.innerHTML)
      const schemaType = schema['@type']

      if (schemaType?.toLowerCase() === 'product') {
        return schema
      }
    }
  })
  await browser.close()

  return productSchema ? schemaToProductData(productSchema, url) : undefined
}

function schemaToProductData(schema: any, url: string): ParsedGift {
  const getPrice = (): ProductPrice | undefined => {
    if (!schema.offers) {
      return undefined
    }

    const offer = Array.isArray(schema.offers)
      ? schema.offers[0]
      : schema.offers
    return {
      amount: offer.price,
      currency: offer.priceCurrency,
    }
  }
  const price = getPrice()

  return {
    imagesUrls: (schema.image as string[] | undefined) ?? [],
    price: price?.amount.toString(),
    priceCurrency: price?.currency,
    name: schema.name,
    link: url,
  }
}
