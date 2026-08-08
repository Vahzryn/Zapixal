import puppeteer from 'puppeteer';
import { createServer } from 'http';
import handler from 'serve-handler';
import assert from 'node:assert';
import path from 'node:path';

// Start a simple static server for the built /dist folder
const server = createServer((request, response) => {
  return handler(request, response, {
    public: path.resolve('./dist')
  });
});

const PORT = 3456;

async function runSmokeTest() {
  console.log('Starting static preview server on port ' + PORT + '...');
  await new Promise<void>((resolve) => server.listen(PORT, resolve));

  console.log('Launching headless browser...');
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Test 1: App loading and low capability fallback simulation
    console.log('Navigating to http://localhost:' + PORT + '...');
    
    // Mock navigator capabilities to simulate LOW device BEFORE navigating
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'hardwareConcurrency', { value: 1 });
      Object.defineProperty(navigator, 'deviceMemory', { value: 2 });
    });
    
    await page.goto('http://localhost:' + PORT, { waitUntil: 'networkidle0' });

    console.log('Checking for title and main elements...');
    const title = await page.title();
    assert.ok(title.length > 0, 'Title should not be empty');

    // Wait for dropzone to be present
    const dropzone = await page.$('.dropzone-container, [role="button"], input[type="file"]');
    assert.ok(dropzone, 'Dropzone or file input should be rendered');
    
    // Check local storage / capabilities state if exposed, or just rely on no errors in console
    
    console.log('✓ Smoke test passed: Page loaded successfully and dropzone found');

  } catch (error) {
    console.error('Smoke test failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
    server.close();
  }
}

runSmokeTest();
