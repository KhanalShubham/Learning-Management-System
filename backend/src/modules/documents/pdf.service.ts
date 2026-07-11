import puppeteer, { PDFOptions, PaperFormat } from 'puppeteer';
import { logger } from '@/config/logger';

export interface IPDFService {
  generatePDF(htmlContent: string, options?: { pageSize?: string; orientation?: string }): Promise<Buffer>;
}

export class PDFService implements IPDFService {
  /**
   * Compiles HTML content to a PDF buffer using headless Puppeteer Chrome.
   */
  public async generatePDF(
    htmlContent: string,
    options: { pageSize?: string; orientation?: string } = {}
  ): Promise<Buffer> {
    logger.info(`Starting Puppeteer PDF compilation with format=${options.pageSize || 'A4'} orientation=${options.orientation || 'PORTRAIT'}`);

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--font-render-hinting=none',
      ],
    });

    try {
      const page = await browser.newPage();
      
      // Inject the compiled HTML content
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' as any });
      
      // Ensure webfonts are loaded
      await page.evaluateHandle('document.fonts.ready');

      // Map schema values to Puppeteer options
      const pdfOptions: PDFOptions = {
        format: (options.pageSize?.toUpperCase() as PaperFormat) || 'A4',
        landscape: options.orientation?.toUpperCase() === 'LANDSCAPE',
        printBackground: true,
        margin: {
          top: '0mm',
          right: '0mm',
          bottom: '0mm',
          left: '0mm',
        },
      };

      const buffer = await page.pdf(pdfOptions);
      logger.info('Puppeteer PDF compiled successfully.');
      return Buffer.from(buffer);
    } catch (error) {
      logger.error('Puppeteer PDF generation error:', error);
      throw error;
    } finally {
      await browser.close();
    }
  }
}
export default PDFService;
