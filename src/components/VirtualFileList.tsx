import React, { useRef, useState, useEffect } from 'react';
import { ImageFileItem } from '../types';
import { FileItem } from './FileItem';

interface VirtualFileListProps {
  files: ImageFileItem[];
  selectedFileIds?: Set<string>;
  onToggleSelect?: (id: string, multi: boolean) => void;
  onRemove: (id: string) => void;
  onRetry?: (id: string) => void;
  onDownload: (item: ImageFileItem) => void;
  onRotate?: (id: string, deltaDegrees: number) => void;
  onCompare?: (item: ImageFileItem) => void;
  onInspectDetails?: (item: ImageFileItem) => void;
}

const ITEM_HEIGHT = 88;
const OVERSCAN = 5;

export const VirtualFileList: React.FC<VirtualFileListProps> = ({
  files,
  selectedFileIds = new Set(),
  onToggleSelect,
  onRemove,
  onRetry,
  onDownload,
  onRotate,
  onCompare,
  onInspectDetails,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        setScrollTop(containerRef.current.scrollTop);
      }
    };
    const el = containerRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll, { passive: true });
      return () => el.removeEventListener('scroll', handleScroll);
    }
  }, []);

  if (files.length <= 20) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" role="list" aria-label="Batch image conversion list">
        {files.map((file, idx) => (
          <FileItem
            key={file.id}
            item={file}
            index={idx}
            isSelected={selectedFileIds.has(file.id)}
            onToggleSelect={onToggleSelect}
            onRemove={onRemove}
            onRetry={onRetry}
            onDownload={onDownload}
            onRotate={onRotate}
            onCompare={onCompare}
            onInspectDetails={onInspectDetails}
          />
        ))}
      </div>
    );
  }

  const containerHeight = 500;
  const totalHeight = files.length * ITEM_HEIGHT;

  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(
    files.length - 1,
    Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + OVERSCAN
  );

  const visibleItems = files.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * ITEM_HEIGHT;

  return (
    <div
      ref={containerRef}
      style={{ height: `${containerHeight}px`, overflowY: 'auto' }}
      className="relative rounded-xl border border-neutral-200 dark:border-neutral-800 p-2"
      role="list"
      aria-label="Virtualized batch image conversion list"
    >
      <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleItems.map((file, idx) => (
            <FileItem
              key={file.id}
              item={file}
              index={startIndex + idx}
              isSelected={selectedFileIds.has(file.id)}
              onToggleSelect={onToggleSelect}
              onRemove={onRemove}
              onRetry={onRetry}
              onDownload={onDownload}
              onRotate={onRotate}
              onCompare={onCompare}
              onInspectDetails={onInspectDetails}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
