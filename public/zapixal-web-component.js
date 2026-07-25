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
          font-family: system-ui, -apple-system, sans-serif;
          max-width: 800px;
          margin: 2rem auto;
          color: #171717;
          line-height: 1.6;
        }
        .zapixal-container {
          border: 1px solid #e5e7eb;
          border-radius: 1.5rem;
          padding: 2rem;
          background: #ffffff;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .aeo-block {
          background: #f8fafc;
          border-left: 4px solid #2563eb;
          padding: 1rem 1.5rem;
          border-radius: 0 0.5rem 0.5rem 0;
          margin-bottom: 2rem;
        }
        .aeo-block h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.125rem;
          color: #0f172a;
        }
        .aeo-block p {
          margin: 0;
          font-size: 0.95rem;
          color: #334155;
        }
        .dropzone {
          border: 2px dashed #cbd5e1;
          border-radius: 1rem;
          padding: 3rem 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
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
        .btn-convert {
          background: #2563eb;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          margin-top: 1rem;
          display: inline-block;
          font-size: 1rem;
          transition: background 0.2s;
        }
        .btn-convert:hover {
          background: #1d4ed8;
        }
        .features-list {
          margin-top: 2rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }
        .feature-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #475569;
        }
        .results {
          margin-top: 1.5rem;
        }
        .result-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: #f1f5f9;
          border-radius: 0.5rem;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }
        .download-link {
          color: #2563eb;
          text-decoration: none;
          font-weight: 600;
        }
      </style>
      <div class="zapixal-container">
        <div class="aeo-block">
          <h3>What is a Client-Side Image Converter?</h3>
          <p><strong>Direct Answer:</strong> A client-side image converter processes files like HEIC, JPG, and PNG entirely within your device's web browser memory. Unlike traditional converters, it never uploads your photos to a server, guaranteeing 100% privacy, zero wait times for uploads, and offline capability once loaded.</p>
        </div>

        <div class="dropzone" id="dropzone">
          <input type="file" id="fileInput" multiple accept="image/*,.heic,.heif">
          <svg style="width: 48px; height: 48px; margin: 0 auto 1rem; color: #64748b;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <div style="font-size: 1.125rem; font-weight: 600; color: #0f172a; margin-bottom: 0.5rem;">Drop images here or click to upload</div>
          <div style="font-size: 0.875rem; color: #64748b;">Supports HEIC, PNG, JPG, WEBP & AVIF (Max 10MB)</div>
        </div>
        
        <div class="results" id="results"></div>

        <div class="features-list">
          <div class="feature-item">
            <svg style="width:20px;height:20px;color:#10b981;" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            100% Private (No Uploads)
          </div>
          <div class="feature-item">
            <svg style="width:20px;height:20px;color:#10b981;" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            Lightning Fast Processing
          </div>
          <div class="feature-item">
            <svg style="width:20px;height:20px;color:#10b981;" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            Works Completely Offline
          </div>
        </div>
        <p style="text-align:center; font-size: 0.75rem; color: #94a3b8; margin-top: 1.5rem;">
          Powered by <a href="https://zapixal.com" target="_blank" style="color: #64748b; text-decoration: underline;">Zapixal</a>
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
      itemDiv.innerHTML = `<span>Processing ${file.name}...</span>`;
      resultsContainer.appendChild(itemDiv);

      try {
        let processFile = file;
        
        // Dynamically load heic2any only if needed
        if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
          itemDiv.innerHTML = `<span>Converting HEIC format for ${file.name}...</span>`;
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
          const url = URL.createObjectURL(blob);
          const newName = processFile.name.replace(/\.[^/.]+$/, "") + "_optimized.jpg";
          itemDiv.innerHTML = `
            <span>✅ ${newName} (${(blob.size / 1024).toFixed(1)} KB)</span>
            <a href="${url}" download="${newName}" class="download-link">Download</a>
          `;
        }, 'image/jpeg', 0.85);

      } catch (err) {
        itemDiv.innerHTML = `<span style="color:red">❌ Failed: ${err.message}</span>`;
      }
    }
  }
}

customElements.define('zapixal-blog-tool', ZapixalBlogWidget);
