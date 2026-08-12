import { collectDiagnostics } from '../src/lib/diagnostics';
import { onRequestPost, onRequestOptions } from '../functions/api/feedback';

async function main() {
  console.log('=== TESTING DIAGNOSTICS & FEEDBACK UTILITY ===');
  
  const diag = collectDiagnostics({
    currentRoute: '/compress-image-under-50kb-government-portal',
    currentToolName: 'Compress Image Under 50KB for Government Portals',
    fileCount: 3,
    hasErrors: false,
    targetFormat: 'jpeg',
    targetMaxKB: 50,
    quality: 0.8,
  });

  if (!diag.browserName) throw new Error('Missing browserName');
  if (!diag.osName) throw new Error('Missing osName');
  if (diag.currentRoute !== '/compress-image-under-50kb-government-portal') throw new Error('Route mismatch');
  if (diag.targetMaxKB !== 50) throw new Error('Target max KB mismatch');
  if (diag.isClientSideOnly !== true) throw new Error('isClientSideOnly should be true');

  const rawObj = diag as any;
  if (rawObj.password || rawObj.token || rawObj.cookie || rawObj.imageData || rawObj.ip) {
    throw new Error('PRIVACY VIOLATION: Sensitive data present in diagnostics object!');
  }
  console.log('✓ Diagnostics Privacy & Accuracy Verification PASSED!');

  console.log('\n=== RUNNING FEEDBACK BACKEND TESTS ===');

  let passed = 0;
  let failed = 0;
  
  // Mock global fetch for discord webhook
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    if (typeof url === 'string' && url.includes('discord.com/api/webhooks')) {
      if (url.includes('fail-webhook')) {
        return new Response('Not Found', { status: 404 });
      }
      return new Response('OK', { status: 200 });
    }
    return originalFetch(url, options);
  };

  const envWithWebhook = { DISCORD_WEBHOOK_URL: 'https://discord.com/api/webhooks/123/abc' };
  const envFailWebhook = { DISCORD_WEBHOOK_URL: 'https://discord.com/api/webhooks/fail-webhook' };
  const envWithoutWebhook = {};

  async function assertStatus(name: string, request: Request, env: any, expectedStatus: number) {
    try {
      const res = await onRequestPost({ request, env });
      if (res.status === expectedStatus) {
        console.log(`✓ [PASSED] ${name}`);
        passed++;
      } else {
        console.error(`✗ [FAILED] ${name} - Expected ${expectedStatus}, got ${res.status}`);
        failed++;
      }
    } catch (e: any) {
      console.error(`✗ [FAILED] ${name} - Exception thrown: ${e.message}`);
      failed++;
    }
  }

  // 1. Valid Positive Submission
  await assertStatus('Valid positive submission', new Request('http://localhost:3000/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'https://zapixal.com' },
    body: JSON.stringify({ isHelpful: true, category: 'General', message: 'Great tool' })
  }), envWithWebhook, 200);

  // 2. Valid Negative Submission
  await assertStatus('Valid negative submission', new Request('http://localhost:3000/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'https://zapixal.com' },
    body: JSON.stringify({ isHelpful: false, category: 'Bug', message: 'Broken' })
  }), envWithWebhook, 200);

  // 3. Missing Webhook Secret
  await assertStatus('Missing webhook secret returns 503', new Request('http://localhost:3000/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'https://zapixal.com' },
    body: JSON.stringify({ isHelpful: true, category: 'General', message: 'Test' })
  }), envWithoutWebhook, 503);

  // 4. Failed Discord Request
  await assertStatus('Failed Discord request returns 502', new Request('http://localhost:3000/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'https://zapixal.com' },
    body: JSON.stringify({ isHelpful: true, category: 'General', message: 'Test' })
  }), envFailWebhook, 502);

  // 5. Invalid JSON
  await assertStatus('Invalid JSON returns 400', new Request('http://localhost:3000/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'https://zapixal.com' },
    body: '{ bad json }'
  }), envWithWebhook, 400);

  // 6. Oversized Payload
  await assertStatus('Oversized payload returns 413', new Request('http://localhost:3000/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'https://zapixal.com' },
    body: JSON.stringify({ isHelpful: true, padding: 'a'.repeat(6 * 1024 * 1024) })
  }), envWithWebhook, 413);

  // 7. Mention Safety
  await assertStatus('Mention safety parsing does not crash', new Request('http://localhost:3000/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'https://zapixal.com' },
    body: JSON.stringify({ isHelpful: true, category: 'General', message: '@everyone @here <@&123456789>' })
  }), envWithWebhook, 200);

  // 8. Screenshot handling
  await assertStatus('Valid screenshot base64 submission', new Request('http://localhost:3000/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'https://zapixal.com' },
    body: JSON.stringify({ isHelpful: false, category: 'Bug', message: 'See screenshot', screenshotBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=' })
  }), envWithWebhook, 200);

  console.log('\n=== RUNNING CORS TESTS ===');
  const corsTest1 = await onRequestOptions({ request: new Request('http://localhost:3000', { headers: { 'Origin': 'https://zapixal.com' } }) });
  if (corsTest1.headers.get('Access-Control-Allow-Origin') === 'https://zapixal.com' && corsTest1.status === 204) {
    console.log('✓ [PASSED] CORS allowed origin: https://zapixal.com'); passed++;
  } else {
    console.error('✗ [FAILED] CORS allowed origin check'); failed++;
  }

  const corsTest2 = await onRequestOptions({ request: new Request('http://localhost:3000', { headers: { 'Origin': 'https://evil-zapixal.com' } }) });
  if (corsTest2.status === 403) {
    console.log('✓ [PASSED] CORS rejected evil origin with HTTP 403'); passed++;
  } else {
    console.error(`✗ [FAILED] CORS rejected evil origin check, got status ${corsTest2.status}`); failed++;
  }
  
  const corsTest3 = await onRequestOptions({ request: new Request('http://localhost:3000', { headers: { 'Origin': 'http://localhost:3000' } }) });
  if (corsTest3.headers.get('Access-Control-Allow-Origin') === 'http://localhost:3000' && corsTest3.status === 204) {
    console.log('✓ [PASSED] CORS allows localhost dev'); passed++;
  } else {
    console.error('✗ [FAILED] CORS allows localhost dev'); failed++;
  }

  // Test POST with unauthorized origin
  await assertStatus('Unauthorized origin POST returns 403', new Request('http://localhost:3000/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'https://attacker.com' },
    body: JSON.stringify({ isHelpful: true, category: 'General', message: 'Spam' })
  }), envWithWebhook, 403);

  // Test invalid screenshot format (bad magic bytes / wrong data)
  await assertStatus('Invalid screenshot header returns 400', new Request('http://localhost:3000/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'https://zapixal.com' },
    body: JSON.stringify({ isHelpful: false, category: 'Bug', message: 'Bad screenshot', screenshotBase64: 'data:image/png;base64,1234567890==' })
  }), envWithWebhook, 400);

  // Test oversized screenshot (> 3MB)
  const oversizedBase64 = 'data:image/png;base64,' + 'A'.repeat(4.5 * 1024 * 1024);
  await assertStatus('Oversized screenshot returns 400', new Request('http://localhost:3000/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'https://zapixal.com' },
    body: JSON.stringify({ isHelpful: false, category: 'Bug', message: 'Huge screenshot', screenshotBase64: oversizedBase64 })
  }), envWithWebhook, 400);

  // Test invalid isHelpful type
  await assertStatus('Invalid isHelpful string returns 400', new Request('http://localhost:3000/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'https://zapixal.com' },
    body: JSON.stringify({ isHelpful: 'true', category: 'General', message: 'Test' })
  }), envWithWebhook, 400);

  await assertStatus('Invalid isHelpful number returns 400', new Request('http://localhost:3000/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'https://zapixal.com' },
    body: JSON.stringify({ isHelpful: 1, category: 'General', message: 'Test' })
  }), envWithWebhook, 400);

  // Test invalid category type and length
  await assertStatus('Invalid category number type returns 400', new Request('http://localhost:3000/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'https://zapixal.com' },
    body: JSON.stringify({ isHelpful: true, category: 123, message: 'Test' })
  }), envWithWebhook, 400);

  await assertStatus('Oversized category returns 400', new Request('http://localhost:3000/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'https://zapixal.com' },
    body: JSON.stringify({ isHelpful: true, category: 'a'.repeat(101), message: 'Test' })
  }), envWithWebhook, 400);

  // Test invalid message type and length
  await assertStatus('Invalid message array type returns 400', new Request('http://localhost:3000/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'https://zapixal.com' },
    body: JSON.stringify({ isHelpful: true, category: 'General', message: ['Test'] })
  }), envWithWebhook, 400);

  await assertStatus('Oversized message returns 400', new Request('http://localhost:3000/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'https://zapixal.com' },
    body: JSON.stringify({ isHelpful: false, category: 'Bug', message: 'A'.repeat(2001) })
  }), envWithWebhook, 400);

  // Test invalid diagnostics type / array / nested
  await assertStatus('Invalid diagnostics string returns 400', new Request('http://localhost:3000/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'https://zapixal.com' },
    body: JSON.stringify({ isHelpful: false, category: 'Bug', message: 'Error', diagnostics: 'bad' })
  }), envWithWebhook, 400);

  await assertStatus('Invalid diagnostics array returns 400', new Request('http://localhost:3000/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'https://zapixal.com' },
    body: JSON.stringify({ isHelpful: false, category: 'Bug', message: 'Error', diagnostics: ['bad'] })
  }), envWithWebhook, 400);

  await assertStatus('Diagnostics with nested object returns 400', new Request('http://localhost:3000/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'https://zapixal.com' },
    body: JSON.stringify({ isHelpful: false, category: 'Bug', message: 'Error', diagnostics: { nested: { bad: true } } })
  }), envWithWebhook, 400);

  await assertStatus('Diagnostics with oversized route string returns 400', new Request('http://localhost:3000/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'https://zapixal.com' },
    body: JSON.stringify({ isHelpful: false, category: 'Bug', message: 'Error', diagnostics: { currentRoute: 'a'.repeat(201) } })
  }), envWithWebhook, 400);

  // Test valid diagnostics object and valid category/message
  await assertStatus('Valid diagnostics object submission', new Request('http://localhost:3000/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'https://zapixal.com' },
    body: JSON.stringify({ isHelpful: true, category: 'UI', message: 'Nice design', diagnostics: diag })
  }), envWithWebhook, 200);

  globalThis.fetch = originalFetch;

  if (failed > 0) {
    console.error(`\nTests failed: ${failed}`);
    process.exit(1);
  } else {
    console.log(`\nAll ${passed} tests passed successfully!`);
  }
}

main().catch(err => {
  console.error('Test script failed:', err);
  process.exit(1);
});
