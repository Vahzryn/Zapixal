import assert from 'assert';
import { parseSeoRoute } from '../src/lib/seoEngine.ts';
import { ConversionSettings, TargetFormat } from '../src/types.ts';

console.log('Running unit tests for Route Presets vs User Customization state management...\n');

class SettingsStateTracker {
  settings: ConversionSettings = {
    targetFormat: 'webp',
    targetFormatMode: 'per-original',
    quality: 0.8,
    resize: { enabled: false, keepAspectRatio: true },
    filenamePrefix: '',
    filenameSuffix: '',
  };

  touchedKeys = new Set<string>();

  updateUserSettings(action: (prev: ConversionSettings) => ConversionSettings) {
    const prev = { ...this.settings };
    const next = action(prev);

    if (next.targetFormat !== prev.targetFormat) this.touchedKeys.add('targetFormat');
    if (next.targetMaxKB !== prev.targetMaxKB) this.touchedKeys.add('targetMaxKB');
    if (next.stripExif !== prev.stripExif) this.touchedKeys.add('stripExif');
    if (JSON.stringify(next.resize) !== JSON.stringify(prev.resize)) this.touchedKeys.add('resize');
    if (JSON.stringify(next.cropAspectRatio) !== JSON.stringify(prev.cropAspectRatio)) this.touchedKeys.add('cropAspectRatio');
    if (next.quality !== prev.quality) this.touchedKeys.add('quality');
    if (next.targetDPI !== prev.targetDPI) this.touchedKeys.add('targetDPI');

    this.settings = next;
  }

  applyRoutePreset(seo: any) {
    let next = { ...this.settings };

    if (!this.touchedKeys.has('targetFormat') && seo.toFormat) {
      next.targetFormat = seo.toFormat;
    }

    if (!this.touchedKeys.has('targetMaxKB')) {
      if (seo.targetMaxKB) {
        next.targetMaxKB = seo.targetMaxKB;
      } else {
        next.targetMaxKB = undefined;
      }
    }

    if (!this.touchedKeys.has('stripExif')) {
      if (seo.stripExif !== undefined) {
        next.stripExif = seo.stripExif;
      }
    }

    if (!this.touchedKeys.has('resize')) {
      if (seo.presetResize) {
        next.resize = {
          enabled: true,
          maxWidth: seo.presetResize.maxWidth,
          maxHeight: seo.presetResize.maxHeight,
          keepAspectRatio: true
        };
      } else if (seo.path.includes('resize') || seo.path.includes('passport') || seo.path.includes('size-reducer')) {
        next.resize = { ...next.resize, enabled: true, keepAspectRatio: true };
      } else {
        next.resize = { ...next.resize, enabled: false };
      }
    }

    if (!this.touchedKeys.has('cropAspectRatio')) {
      if (seo.path.includes('crop')) {
        next.cropAspectRatio = { width: 16, height: 9 };
      } else {
        next.cropAspectRatio = null;
      }
    }

    this.settings = next;
  }

  resetWorkflow() {
    this.touchedKeys.clear();
  }
}

// 1. Fresh Visit Defaults
{
  const tracker = new SettingsStateTracker();

  // Fresh visit to 50KB compression route
  const compressSeo = await parseSeoRoute('/compress-image-under-50kb-government-portal');
  tracker.applyRoutePreset(compressSeo);
  assert.strictEqual(tracker.settings.targetMaxKB, 50, 'Fresh visit to 50KB route should set targetMaxKB to 50');

  // Fresh visit to passport photo route
  const passportTracker = new SettingsStateTracker();
  const passportSeo = await parseSeoRoute('/passport-photo-size-reducer-kb');
  passportTracker.applyRoutePreset(passportSeo);
  assert.strictEqual(passportTracker.settings.resize.enabled, true, 'Passport route should enable resize');

  // Fresh visit to HEIC to JPG format route
  const heicTracker = new SettingsStateTracker();
  const heicSeo = await parseSeoRoute('/convert-heic-to-jpg-locally');
  heicTracker.applyRoutePreset(heicSeo);
  assert.strictEqual(heicTracker.settings.targetFormat, 'jpg', 'HEIC to JPG route should set targetFormat to jpg');

  console.log('✓ Fresh visit route preset defaults verified');
}

// 2. User Customization Preservation Across Route Navigation
{
  const tracker = new SettingsStateTracker();

  // 1. Fresh visit to 50KB route -> gets 50KB default
  const compressSeo = await parseSeoRoute('/compress-image-under-50kb-government-portal');
  tracker.applyRoutePreset(compressSeo);
  assert.strictEqual(tracker.settings.targetMaxKB, 50);

  // 2. User manually changes targetMaxKB to 30
  tracker.updateUserSettings(prev => ({ ...prev, targetMaxKB: 30 }));
  assert.strictEqual(tracker.settings.targetMaxKB, 30);
  assert.strictEqual(tracker.touchedKeys.has('targetMaxKB'), true, 'targetMaxKB should be marked as touched');

  // 3. User navigates to a format conversion route (/convert-avif-to-jpg-converter)
  const avifJpgSeo = await parseSeoRoute('/convert-avif-to-jpg-converter');
  tracker.applyRoutePreset(avifJpgSeo);

  // targetFormat should be set to 'jpg' because targetFormat was untouched
  assert.strictEqual(tracker.settings.targetFormat, 'jpg', 'Untouched format should update to route preset');
  // targetMaxKB MUST remain 30 because it was user-customized
  assert.strictEqual(tracker.settings.targetMaxKB, 30, 'User-customized targetMaxKB must not be cleared or overwritten by route change');

  console.log('✓ User customization preservation across routes verified');
}

// 3. User Target Format Customization Preservation
{
  const tracker = new SettingsStateTracker();

  // User manually selects 'avif' as target format
  tracker.updateUserSettings(prev => ({ ...prev, targetFormat: 'avif' as TargetFormat }));
  assert.strictEqual(tracker.settings.targetFormat, 'avif');
  assert.strictEqual(tracker.touchedKeys.has('targetFormat'), true);

  // Navigate to /convert-avif-to-jpg-converter which specifies toFormat='jpg'
  const avifJpgSeo = await parseSeoRoute('/convert-avif-to-jpg-converter');
  tracker.applyRoutePreset(avifJpgSeo);

  assert.strictEqual(tracker.settings.targetFormat, 'avif', 'User manually chosen targetFormat must be preserved across route changes');

  console.log('✓ User target format choice preservation verified');
}

// 4. User Resize and Crop Customization Preservation
{
  const tracker = new SettingsStateTracker();

  // User manually enables resize with custom dimensions
  tracker.updateUserSettings(prev => ({
    ...prev,
    resize: { enabled: true, maxWidth: 1200, maxHeight: 800, keepAspectRatio: false }
  }));
  assert.strictEqual(tracker.touchedKeys.has('resize'), true);

  // Navigate to a non-resize route
  const compressSeo = await parseSeoRoute('/compress-image-under-50kb-government-portal');
  tracker.applyRoutePreset(compressSeo);

  assert.strictEqual(tracker.settings.resize.enabled, true, 'Custom user resize settings must remain enabled');
  assert.strictEqual(tracker.settings.resize.maxWidth, 1200);

  console.log('✓ User resize/crop customization preservation verified');
}

// 5. Reset Workflow / Clear Queue Restores Route Default Ability
{
  const tracker = new SettingsStateTracker();

  // User customizes targetMaxKB
  tracker.updateUserSettings(prev => ({ ...prev, targetMaxKB: 25 }));
  assert.strictEqual(tracker.settings.targetMaxKB, 25);

  // User clears queue / starts fresh workflow
  tracker.resetWorkflow();
  assert.strictEqual(tracker.touchedKeys.size, 0, 'Touched keys should be cleared on workflow reset');

  // Navigate to 50KB route after workflow reset
  const compressSeo = await parseSeoRoute('/compress-image-under-50kb-government-portal');
  tracker.applyRoutePreset(compressSeo);
  assert.strictEqual(tracker.settings.targetMaxKB, 50, 'Fresh workflow after reset should receive new route default');

  console.log('✓ Workflow reset / queue clear allows fresh route defaults again');
}

// 6. Tools Directory Route Verification
{
  const toolsSeo = await parseSeoRoute('/tools');
  assert.strictEqual(toolsSeo.path, '/tools', '/tools path must match');
  assert.strictEqual(toolsSeo.isIndexable, true, '/tools must be indexable');
  assert.strictEqual(toolsSeo.canonicalUrl, 'https://zapixal.com/tools', 'Canonical URL must be /tools');
  assert.ok(toolsSeo.metaTitle.includes('Tools'), '/tools title must reference Tools');
  assert.ok(toolsSeo.metaDescription.includes('free, client-side'), '/tools description must reference client-side tools');

  console.log('✓ /tools Directory route metadata verified');
}

console.log('All route preset vs user customization tests passed successfully!\n');
