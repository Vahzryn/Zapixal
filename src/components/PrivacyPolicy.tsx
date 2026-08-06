import React from 'react';

export function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-4xl font-black text-neutral-900 dark:text-white mb-8 tracking-tight">Privacy Policy</h1>
      
      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-neutral-600 dark:text-[#bdc1c6] leading-relaxed">
        <p className="text-lg font-medium text-neutral-800 dark:text-[#e8eaed]">
          Last Updated: August 6, 2026
        </p>

        <section className="bg-emerald-50 dark:bg-[#1e3427] p-6 rounded-2xl border border-emerald-100 dark:border-[#2d523c] mb-8">
          <h2 className="text-2xl font-bold text-emerald-800 dark:text-[#81c995] mb-4 mt-0">100% Local Processing Guarantee</h2>
          <p className="mb-0 text-emerald-700 dark:text-[#a8dabb]">
            Zapixal is built on a strict zero-upload architecture. <strong>100% of image processing occurs locally in your browser memory</strong> using WebAssembly and HTML5 Canvas. We expressly declare that no images, personal data, or camera metadata are ever transmitted to, logged by, or stored on external servers.
          </p>
        </section>

        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mt-8">1. Data We Do Not Collect</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Images & Files:</strong> Your files never leave your device. There is no cloud storage or server upload step.</li>
          <li><strong>Metadata (EXIF):</strong> When you choose to strip metadata, it is removed entirely within your browser environment.</li>
          <li><strong>Personal Information:</strong> We do not require accounts, signups, or email addresses to use the service.</li>
        </ul>

        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mt-8">2. Analytics and Telemetry</h2>
        <p>
          We do not use any analytics, cookies, telemetry, or third-party tracking beacons of any kind. 100% of processing and preference storage stays on-device, meaning we do not collect, send, or monitor usage data.
        </p>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mt-8">3. Local Storage</h2>
        <p>
          Zapixal may use your browser's local storage (localStorage) exclusively to remember your UI preferences (such as Light/Dark mode and preferred conversion settings). This data remains entirely on your device.
        </p>

        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mt-8">4. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Since our architecture relies fundamentally on zero-upload local processing, any changes will only reflect updates to UI preferences or core features, never a compromise to your image privacy.
        </p>
        
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mt-8">5. Contact Us</h2>
        <p>
          If you have any questions about our privacy practices, please contact us at <strong>vahzryn@zapixal.com</strong>.
        </p>
      </div>
    </div>
  );
}
