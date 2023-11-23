import puppeteer, { Browser } from 'puppeteer'
import { Service } from 'typedi'

import { AppConfigService } from '@/common/AppConfigService'

@Service()
export class PuppeteerService {
  private browser: Browser | undefined
  private browsersWithProxy = new Map<string, Browser>()

  constructor(private config: AppConfigService) {}

  async getBrowser(proxyCountry?: string): Promise<Browser> {
    if (proxyCountry) {
      const browser = this.browsersWithProxy.get(proxyCountry)
      if (!browser || !browser.isConnected()) {
        return this.createBrowserWithProxy(proxyCountry)
      } else {
        return browser
      }
    }

    if (!this.browser || this.browser?.isConnected()) {
      return this.createBrowser()
    } else {
      return this.browser
    }
  }

  private async createBrowser(): Promise<Browser> {
    console.log('Launching browser...')
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    this.browser.on('disconnected', () => this.createBrowser())
    console.log('Init...Done')
    return this.browser
  }

  private async createBrowserWithProxy(countryCode: string): Promise<Browser> {
    console.log(`Launching browser with country proxy = ${countryCode}...`)
    const proxyUser = `brd-customer-hl_d40b5744-zone-residential-country-${countryCode}`

    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--proxy-server=brd.superproxy.io:22225',
        `--proxy-auth=${proxyUser}:${this.config.env.BRIGHT_DATA_PASSWORD}`,
      ],
    })
    this.browsersWithProxy.set(countryCode, browser)
    browser.on('disconnected', () => this.createBrowserWithProxy(countryCode))
    console.log('Init...Done')
    return browser
  }
}
