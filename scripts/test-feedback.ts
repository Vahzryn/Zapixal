import { collectDiagnostics } from '../src/lib/diagnostics';

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

  console.log('Collected Diagnostics Sample:');
  console.log(JSON.stringify(diag, null, 2));

  // Assert essential non-sensitive fields
  if (!diag.browserName) throw new Error('Missing browserName');
  if (!diag.osName) throw new Error('Missing osName');
  if (diag.currentRoute !== '/compress-image-under-50kb-government-portal') throw new Error('Route mismatch');
  if (diag.targetMaxKB !== 50) throw new Error('Target max KB mismatch');
  if (diag.isClientSideOnly !== true) throw new Error('isClientSideOnly should be true');

  // Verify privacy: ensure no sensitive keys exist
  const rawObj = diag as any;
  if (rawObj.password || rawObj.token || rawObj.cookie || rawObj.imageData || rawObj.ip) {
    throw new Error('PRIVACY VIOLATION: Sensitive data present in diagnostics object!');
  }

  console.log('✓ Diagnostics Privacy & Accuracy Verification PASSED!');
}

main().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
