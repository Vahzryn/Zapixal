import { useState, useCallback } from 'react';
import { ImageFileItem, ConversionSettings } from '../types';
import { SeoRouteData } from '../lib/seoEngine';
import { generateShareUrl } from '../lib/shareConfig';
import { hasClipboardImageWrite } from '../lib/capabilities';

interface UseShareActionsOptions {
  files: ImageFileItem[];
}

export function useShareActions({ files }: UseShareActionsOptions) {
  const [isCopiedShareLink, setIsCopiedShareLink] = useState(false);
  const [isCopiedSettingsLink, setIsCopiedSettingsLink] = useState(false);
  const [copiedSuccessImage, setCopiedSuccessImage] = useState(false);
  const [clipboardError, setClipboardError] = useState<string | null>(null);

  const handleShareApp = useCallback(async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : "https://www.zapixal.com";
    const shareUrl = origin;
    const sharePayload = {
      title: "Zapixal - Fast & Private Image Converter",
      text: "Check out Zapixal! Free batch image converter that processes files locally.",
      url: shareUrl,
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(sharePayload);
        setIsCopiedShareLink(true);
        setTimeout(() => setIsCopiedShareLink(false), 2000);
      } catch (err: any) {
        if (err?.name !== 'AbortError' && err?.name !== 'NotAllowedError') {
          try {
            if (navigator?.clipboard?.writeText) {
              await navigator.clipboard.writeText(shareUrl);
              setIsCopiedShareLink(true);
              setTimeout(() => setIsCopiedShareLink(false), 2000);
            }
          } catch (clipErr) {
            console.error('Clipboard fallback error:', clipErr);
          }
        }
      }
    } else {
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(shareUrl);
          setIsCopiedShareLink(true);
          setTimeout(() => setIsCopiedShareLink(false), 2000);
        }
      } catch (err) {
        console.error('Clipboard copy error:', err);
      }
    }
  }, []);

  const handleShareSettings = useCallback(async (
    currentPath: string,
    settings: ConversionSettings,
    seoData?: SeoRouteData
  ) => {
    const shareUrl = generateShareUrl(currentPath, settings, seoData);
    const title = seoData?.h1Title || "Zapixal Tool Settings";
    const text = "Open this tool with pre-configured compression and conversion settings.";

    const copyToClipboard = async () => {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setIsCopiedSettingsLink(true);
        setTimeout(() => setIsCopiedSettingsLink(false), 2000);
      }
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
        setIsCopiedSettingsLink(true);
        setTimeout(() => setIsCopiedSettingsLink(false), 2000);
      } catch (err: any) {
        if (err?.name !== 'AbortError' && err?.name !== 'NotAllowedError') {
          try {
            await copyToClipboard();
          } catch (clipErr) {
            console.error('Clipboard fallback error:', clipErr);
          }
        }
      }
    } else {
      try {
        await copyToClipboard();
      } catch (err) {
        console.error('Clipboard copy error:', err);
      }
    }
    return shareUrl;
  }, []);

  const handleCopyConvertedToClipboard = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    setClipboardError(null);
    const successFiles = files.filter(f => f.status === 'success' && f.blob);
    if (successFiles.length === 0) {
      const err = 'No converted image available to copy.';
      setClipboardError(err);
      return { success: false, error: err };
    }

    if (!hasClipboardImageWrite()) {
      const err = 'Image clipboard copy is not supported in this browser or context.';
      setClipboardError(err);
      return { success: false, error: err };
    }

    const itemToCopy = successFiles[successFiles.length - 1];
    let createdObjectUrl: string | null = null;

    try {
      let pngBlob = itemToCopy.blob!;

      if (pngBlob.type !== 'image/png') {
        const img = new Image();
        createdObjectUrl = URL.createObjectURL(pngBlob);
        
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Failed to decode image data for clipboard conversion.'));
          img.src = createdObjectUrl!;
        });

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 1;
        canvas.height = img.naturalHeight || 1;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Canvas 2D context unavailable.');
        }
        ctx.drawImage(img, 0, 0);

        const converted = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((b) => resolve(b), 'image/png');
        });

        if (!converted) {
          throw new Error('Failed to encode image to PNG for clipboard.');
        }
        pngBlob = converted;
      }

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': pngBlob })
      ]);

      setCopiedSuccessImage(true);
      setTimeout(() => setCopiedSuccessImage(false), 2000);
      return { success: true };
    } catch (err: any) {
      const errMsg = err?.name === 'NotAllowedError'
        ? 'Clipboard permission was denied.'
        : (err?.message || 'Failed to copy image to clipboard.');
      setClipboardError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      if (createdObjectUrl) {
        URL.revokeObjectURL(createdObjectUrl);
      }
    }
  }, [files]);

  return {
    isCopiedShareLink,
    isCopiedSettingsLink,
    copiedSuccessImage,
    clipboardError,
    handleShareApp,
    handleShareSettings,
    handleCopyConvertedToClipboard,
  };
}
