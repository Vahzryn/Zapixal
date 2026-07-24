document.addEventListener('DOMContentLoaded', () => {
  const auditResult = document.getElementById('audit-result');
  const btnOptimize = document.getElementById('btn-optimize-deep');
  const btnExtract = document.getElementById('btn-extract');

  // Query active tab to get images payload and urls
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0] || !tabs[0].id || tabs[0].url.startsWith('chrome://')) {
      auditResult.innerText = "Cannot analyze this page.";
      btnExtract.disabled = true;
      btnExtract.style.opacity = '0.5';
      return;
    }

    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => {
        const images = Array.from(document.querySelectorAll('img'));
        let totalSize = 0;
        const urls = [];
        
        images.forEach(img => {
          if (img.src && !img.src.startsWith('data:')) {
            urls.push(img.src);
            // We use natural sizes or simple estimation for DOM images if we can't get actual sizes
          }
        });
        
        // Use performance API to get actual image sizes if available
        const resources = performance.getEntriesByType('resource');
        let actualSize = 0;
        let imageCount = 0;
        
        resources.forEach(r => {
          if (r.initiatorType === 'img' || r.name.match(/\.(jpg|jpeg|png|webp|avif|heic|gif)$/i)) {
            actualSize += r.transferSize || r.decodedBodySize || 0;
            imageCount++;
          }
        });

        // Fallback estimation if performance API didn't yield sizes
        if (actualSize === 0 && urls.length > 0) {
          // just an arbitrary average if cross-origin restricts transferSize
          actualSize = urls.length * 150 * 1024; 
        }

        return {
          actualSize,
          imageCount: Math.max(imageCount, urls.length),
          urls: urls
        };
      }
    }, (results) => {
      if (chrome.runtime.lastError) {
        auditResult.innerText = "Analysis failed.";
        return;
      }
      
      if (results && results[0] && results[0].result) {
        const { actualSize, imageCount, urls } = results[0].result;
        
        if (imageCount === 0) {
          auditResult.innerText = "No images found on page.";
          return;
        }

        const sizeMB = (actualSize / (1024 * 1024)).toFixed(2);
        auditResult.innerHTML = `Found <span>${imageCount}</span> images (~<span>${sizeMB} MB</span> payload).`;
        
        if (actualSize > 500 * 1024) { // Show if > 500KB
          btnOptimize.classList.remove('hidden');
        }

        btnExtract.onclick = () => {
          if (urls.length > 0) {
            // Encode the URLs and pass to Zapixal. Usually there's a limit to URL length,
            // we can pass them in localStorage via script, or just pass a batch param.
            // For now, pass up to 10 URLs in the query string or simply open Zapixal batch mode
            const batchParams = new URLSearchParams();
            batchParams.set('action', 'batch');
            urls.slice(0, 15).forEach((url) => {
              batchParams.append('src', url);
            });
            chrome.tabs.create({ url: `https://zapixal.com/batch?${batchParams.toString()}` });
          }
        };
      }
    });
  });
});
