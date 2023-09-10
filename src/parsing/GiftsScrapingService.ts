import { Service } from 'typedi'
import { URL } from 'url'

import { scrapeProductUsingStructuredData } from '@/parsing/functions/scrapeProductUsingStructuredData'
import { scrapeProductFromAmazon } from '@/parsing/functions/scrapeProductFromAmazon'
import { ParsedGift } from '@/parsing/dto/ParsedGift.dto'

@Service()
export class GiftsScrapingService {
  async parseGiftByUrl(url: string): Promise<ParsedGift | undefined> {
    let parsedGift: ParsedGift | undefined
    if (new URL(url).hostname.includes('amazon')) {
      parsedGift = await scrapeProductFromAmazon(url)
    } else {
      parsedGift = await scrapeProductUsingStructuredData(url)
    }

    if (!parsedGift) {
      return undefined
    }

    return {
      ...parsedGift,
      name: parsedGift.name
        ? this.shortenString(parsedGift.name, 70)
        : undefined,
    }
  }

  private shortenString(str: string, maxCharacters: number): string {
    return str.length > maxCharacters
      ? `${str.slice(0, maxCharacters)}...`
      : str
  }
}
