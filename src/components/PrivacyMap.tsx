import React from 'react';
import { ShieldCheck, Map as MapIcon, Download, Info } from 'lucide-react';

export const PrivacyMap = () => {
  const [gps, setGps] = React.useState<{ latitude: number, longitude: number } | null>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [scrubbedUrl, setScrubbedUrl] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const processFile = async (targetFile: File) => {
    if (!targetFile) return;
    setFile(targetFile);
    setScrubbedUrl(null);
    try {
      const exifrModule = await import('exifr');
      const exifr = exifrModule.default || exifrModule;
      const parsed = await exifr.gps(targetFile);
      if (parsed) {
        setGps({ latitude: parsed.latitude, longitude: parsed.longitude });
      } else {
        setGps(null);
      }
    } catch (err) {
      console.error('Error parsing EXIF', err);
      setGps(null);
    }
  };

  React.useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleScrub = async () => {
    if (!file) return;
    try {
      // Very basic scrub simulation. In a real app we'd use a canvas/buffer to strip EXIF.
      // Since canvas strips EXIF automatically when drawn, we'll just do that.
      const img = new Image();
      const url = URL.createObjectURL(file);
      await new Promise((res) => { img.onload = res; img.src = url; });
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const newUrl = URL.createObjectURL(blob);
          setScrubbedUrl(newUrl);
          
          // Auto-trigger download
          const a = document.createElement('a');
          a.href = newUrl;
          a.download = `safe_${file.name}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      }, file.type);
    } catch (e) {
      console.error('Error scrubbing', e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold mb-4 flex items-center justify-center gap-3">
          <MapIcon className="w-8 h-8 text-blue-500" />
          Interactive EXIF Privacy Map
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          Visualize hidden GPS metadata in your photos before you share them online.
        </p>
      </div>

      <div 
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl p-12 text-center bg-white dark:bg-[#303134] mb-8 cursor-pointer hover:border-blue-500 hover:bg-neutral-50 dark:hover:bg-[#3c4043] transition-colors"
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileInput} 
          className="hidden" 
          accept="image/*" 
        />
        <p className="text-lg font-medium text-neutral-500 dark:text-neutral-400">
          Drag & drop a photo, paste from clipboard, or click to select
        </p>
      </div>

      {file && (
        <div className="bg-white dark:bg-[#303134] rounded-2xl p-6 border border-neutral-200 dark:border-neutral-700 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Analysis Results</h2>
          {gps ? (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-red-600 font-bold mb-2 flex items-center gap-2"><Info className="w-5 h-5"/> WARNING: GPS Data Found!</p>
                <p className="mb-4 text-neutral-600 dark:text-neutral-300">Latitude: {gps.latitude.toFixed(5)}<br/>Longitude: {gps.longitude.toFixed(5)}</p>
                <button 
                  onClick={handleScrub}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl w-full flex justify-center items-center gap-2"
                >
                  <ShieldCheck className="w-5 h-5" />
                  Scrub EXIF & Download Safe Version
                </button>
                {scrubbedUrl && (
                  <a href={scrubbedUrl} download={`safe_${file.name}`} className="mt-4 block text-center text-blue-500 font-bold hover:underline">
                    Click here if download didn't start
                  </a>
                )}
              </div>
              <div className="h-64 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700">
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${gps.longitude-0.01},${gps.latitude-0.01},${gps.longitude+0.01},${gps.latitude+0.01}&layer=mapnik&marker=${gps.latitude},${gps.longitude}`}
                ></iframe>
              </div>
            </div>
          ) : (
            <div className="text-green-600 font-bold flex items-center justify-center gap-2 p-8">
              <ShieldCheck className="w-8 h-8" />
              No GPS Data Found. This image is safe to share!
            </div>
          )}
        </div>
      )}
    </div>
  );
};
