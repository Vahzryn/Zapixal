import { renderApp } from '../src/entry-server';

async function main() {
  try {
    const testPath = '/convert-heic-to-jpg-locally';
    const html = await renderApp(testPath);
    console.log(html);
  } catch (error) {
    console.error('SSR test failed:', error);
    process.exit(1);
  }
}

main();
