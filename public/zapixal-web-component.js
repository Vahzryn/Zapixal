class ZapixalBlogWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.injectSchema();
    this.setupListeners();
  }

  injectSchema() {
    if (!document.querySelector('#zapixal-schema')) {
      const script = document.createElement('script');
      script.id = 'zapixal-schema';
      script.type = 'application/ld+json';
      script.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Zapixal Image Converter",
        "operatingSystem": "Web Browser",
        "applicationCategory": "MultimediaApplication",
        "description": "Lightning-fast, 100% private client-side batch image converter. Convert HEIC, PNG, JPG, WEBP, and AVIF locally in your browser without server uploads.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        }
      });
      document.head.appendChild(script);
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          max-width: 800px;
          margin: 1rem auto;
          color: #0f172a;
          line-height: 1.5;
          container-type: inline-size;
          container-name: zapixal-widget;
        }
        .zapixal-container {
          border: 1px solid #e2e8f0;
          border-radius: 1.25rem;
          padding: 1.5rem;
          background: #ffffff;
          box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          gap: 1rem;
          box-sizing: border-box;
        }

        /* Compact Info Box (AEO Direct Answer) */
        .aeo-block {
          background: #f8fafc;
          border-left: 3px solid #2563eb;
          padding: 0.625rem 0.875rem;
          border-radius: 0 0.5rem 0.5rem 0;
          margin: 0;
        }
        .aeo-block p {
          margin: 0;
          font-size: 0.8125rem;
          color: #334155;
          line-height: 1.45;
        }

        /* Primary Utility Dropzone - Prominent & Above Fold */
        .dropzone {
          border: 2px dashed #cbd5e1;
          border-radius: 1rem;
          padding: 1.75rem 1.25rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #f8fafc;
          position: relative;
        }
        .dropzone:hover, .dropzone.dragover {
          border-color: #2563eb;
          background: #eff6ff;
        }
        .dropzone input[type="file"] {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }

        .drop-title {
          font-size: 1rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.25rem;
        }
        .drop-subtitle {
          font-size: 0.8125rem;
          color: #64748b;
        }

        .features-list {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
          margin-top: 0.25rem;
        }
        .feature-item {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.375rem;
          font-size: 0.78125rem;
          font-weight: 600;
          color: #475569;
          background: #f1f5f9;
          padding: 0.375rem 0.5rem;
          border-radius: 0.375rem;
          text-align: center;
          white-space: nowrap;
        }

        .results {
          margin-top: 0.5rem;
        }
        .result-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.625rem 0.875rem;
          background: #f1f5f9;
          border-radius: 0.5rem;
          margin-bottom: 0.5rem;
          font-size: 0.85rem;
          font-weight: 500;
        }
        .download-link {
          color: #2563eb;
          text-decoration: none;
          font-weight: 700;
          background: #dbeafe;
          padding: 0.25rem 0.625rem;
          border-radius: 0.375rem;
          transition: background 0.15s;
        }
        .download-link:hover {
          background: #bfdbfe;
        }

        /* CONTAINER QUERIES for Narrow Container / Sidebar Integration (<480px or <350px) */
        @container zapixal-widget (max-width: 480px) {
          .zapixal-container {
            padding: 1rem;
            border-radius: 0.875rem;
            gap: 0.75rem;
          }
          .aeo-block {
            padding: 0.5rem 0.625rem;
          }
          .aeo-block p {
            font-size: 0.75rem;
          }
          .dropzone {
            padding: 1rem 0.5rem;
          }
          .dropzone svg {
            width: 32px !important;
            height: 32px !important;
            margin-bottom: 0.375rem !important;
          }
          .drop-title {
            font-size: 0.875rem;
          }
          .drop-subtitle {
            font-size: 0.71875rem;
          }
          .features-list {
            grid-template-columns: 1fr;
            gap: 0.375rem;
          }
          .feature-item {
            font-size: 0.71875rem;
            justify-content: flex-start;
            padding: 0.25rem 0.5rem;
          }
        }

        @container zapixal-widget (max-width: 320px) {
          .aeo-block {
            display: none; /* Hide explanatory paragraph in ultra-narrow sidebars to guarantee dropzone is 100% top priority */
          }
          .dropzone {
            padding: 0.875rem 0.375rem;
          }
          .features-list {
            display: none;
          }
        }

        /* Fallback CSS Media Queries for legacy browsers */
        @media (max-width: 480px) {
          .zapixal-container {
            padding: 1rem;
          }
          .dropzone {
            padding: 1rem 0.5rem;
          }
          .features-list {
            grid-template-columns: 1fr;
          }
        }
      </style>
      <div class="zapixal-container">
        <!-- Compact 1-2 sentence AEO direct answer block -->
        <div class="aeo-block">
          <p><strong>Zapixal Converter:</strong> Processes HEIC, PNG, JPG, and WEBP photos 100% inside browser memory with zero server uploads and instant conversion speed.</p>
        </div>

        <!-- Prominent Dropzone Priority -->
        <div class="dropzone" id="dropzone">
          <input type="file" id="fileInput" multiple accept="image/*,.heic,.heif">
          <svg style="width: 42px; height: 42px; margin: 0 auto 0.625rem; color: #2563eb;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <div class="drop-title">Drop images here or click to upload</div>
          <div class="drop-subtitle">Supports HEIC, PNG, JPG, WEBP & AVIF (Max 50MB batch)</div>
        </div>
        
        <div class="results" id="results"></div>

        <div class="features-list">
          <div class="feature-item">
            <svg style="width:16px;height:16px;color:#10b981;flex-shrink:0;" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
            <span>100% Private</span>
          </div>
          <div class="feature-item">
            <svg style="width:16px;height:16px;color:#10b981;flex-shrink:0;" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
            <span>Zero Upload Wait</span>
          </div>
          <div class="feature-item">
            <svg style="width:16px;height:16px;color:#10b981;flex-shrink:0;" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
            <span>Works Offline</span>
          </div>
        </div>

        <p style="text-align:center; font-size: 0.71875rem; color: #94a3b8; margin: 0.25rem 0 0 0;">
          Powered by <a href="https://zapixal.com" target="_blank" style="color: #475569; text-decoration: underline; font-weight: 600;">Zapixal</a>
        </p>
      </div>
    `;
  }

  setupListeners() {
    const fileInput = this.shadowRoot.getElementById('fileInput');
    const dropzone = this.shadowRoot.getElementById('dropzone');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, () => dropzone.classList.add('dragover'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, () => dropzone.classList.remove('dragover'), false);
    });

    dropzone.addEventListener('drop', (e) => {
      let dt = e.dataTransfer;
      let files = dt.files;
      this.handleFiles(files);
    }, false);

    fileInput.addEventListener('change', (e) => {
      this.handleFiles(e.target.files);
    });
  }

  async handleFiles(files) {
    const resultsContainer = this.shadowRoot.getElementById('results');
    resultsContainer.innerHTML = '';
    
    for (const file of files) {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'result-item';

      const statusSpan = document.createElement('span');
      statusSpan.textContent = `Processing ${file.name}...`;
      itemDiv.appendChild(statusSpan);
      resultsContainer.appendChild(itemDiv);

      try {
        let processFile = file;
        
        // Dynamically load heic2any only if needed
        if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
          statusSpan.textContent = `Converting HEIC format for ${file.name}...`;
          if (!window.heic2any) {
            await new Promise((resolve, reject) => {
              const script = document.createElement('script');
              script.src = '/vendor/heic2any.min.js';
              script.onload = resolve;
              script.onerror = reject;
              document.head.appendChild(script);
            });
          }
          const convertedBlob = await window.heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.8
          });
          processFile = new File([convertedBlob], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' });
        }

        // Convert using Canvas for optimization
        const bitmap = await createImageBitmap(processFile);
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bitmap, 0, 0);
        
        canvas.toBlob((blob) => {
          if (!blob) {
            itemDiv.replaceChildren();
            const errSpan = document.createElement('span');
            errSpan.style.color = 'red';
            errSpan.textContent = '❌ Failed: Canvas export produced empty image.';
            itemDiv.appendChild(errSpan);
            return;
          }
          const url = URL.createObjectURL(blob);
          const newName = processFile.name.replace(/\.[^/.]+$/, "") + "_optimized.jpg";

          itemDiv.replaceChildren();

          const infoSpan = document.createElement('span');
          infoSpan.textContent = `✅ ${newName} (${(blob.size / 1024).toFixed(1)} KB)`;

          const downloadA = document.createElement('a');
          downloadA.setAttribute('href', url);
          downloadA.setAttribute('download', newName);
          downloadA.className = 'download-link';
          downloadA.textContent = 'Download';

          itemDiv.appendChild(infoSpan);
          itemDiv.appendChild(downloadA);
        }, 'image/jpeg', 0.85);

      } catch (err) {
        itemDiv.replaceChildren();
        const errSpan = document.createElement('span');
        errSpan.style.color = 'red';
        errSpan.textContent = `❌ Failed: ${err && err.message ? err.message : String(err)}`;
        itemDiv.appendChild(errSpan);
      }
    }
  }
}

customElements.define('zapixal-blog-tool', ZapixalBlogWidget);
