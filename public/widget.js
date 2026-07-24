(function() {
  const container = document.getElementById('zapixal-widget');
  if (container) {
    container.innerHTML = `
      <div style="border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; font-family: sans-serif; max-width: 300px;">
        <h4 style="margin:0 0 8px 0; font-size: 16px; font-weight: bold;">Optimize Images Offline</h4>
        <p style="margin:0 0 12px 0; font-size: 13px; color: #475569;">Zapixal is a 100% private, client-side image converter.</p>
        <a href="https://zapixal.com" target="_blank" style="display: block; padding: 8px 12px; background: #2563eb; color: white; text-align: center; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: bold;">
          Open Zapixal
        </a>
      </div>
    `;
  }
})();
