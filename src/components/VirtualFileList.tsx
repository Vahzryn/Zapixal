import React, { useRef, useState, useEffect } from 'react';
import { ImageFileItem, TargetFormat } from '../types';
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
  onUpdateFormat?: (id: string, format: TargetFormat | undefined) => void;
  onReformatItem?: (id: string, format: TargetFormat) => void;
}

const ITEM_HEIGHT = 88;
const OVERSCAN = 5;

const VirtualFileListImpl: React.FC<VirtualFileListProps> = ({
  files,
  selectedFileIds = new Set(),
  onToggleSelect,
  onRemove,
  onRetry,
  onDownload,
  onRotate,
  onCompare,
  onInspectDetails,
  onUpdateFormat,
  onReformatItem,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [columnCount, setColumnCount] = useState(1);

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

  useEffect(() => {
    const smQuery = window.matchMedia('(min-width: 640px)');
    const lgQuery = window.matchMedia('(min-width: 1024px)');

    const updateColumns = () => {
      if (lgQuery.matches) {
        setColumnCount(3);
      } else if (smQuery.matches) {
        setColumnCount(2);
      } else {
        setColumnCount(1);
      }
    };

    updateColumns();

    if (smQuery.addEventListener) {
      smQuery.addEventListener('change', updateColumns);
      lgQuery.addEventListener('change', updateColumns);
      return () => {
        smQuery.removeEventListener('change', updateColumns);
        lgQuery.removeEventListener('change', updateColumns);
      };
    } else {
      smQuery.addListener(updateColumns);
      lgQuery.addListener(updateColumns);
      return () => {
        smQuery.removeListener(updateColumns);
        lgQuery.removeListener(updateColumns);
      };
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
            onUpdateFormat={onUpdateFormat}
            onReformatItem={onReformatItem}
          />
        ))}
      </div>
    );
  }

  const containerHeight = 500;
  const rowCount = Math.ceil(files.length / columnCount);
  const totalHeight = rowCount * ITEM_HEIGHT;

  const startRow = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
  const endRow = Math.min(
    rowCount - 1,
    Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + OVERSCAN
  );

  const startIndex = startRow * columnCount;
  const endIndex = Math.min(files.length - 1, (endRow + 1) * columnCount - 1);

  const visibleItems = files.slice(startIndex, endIndex + 1);
  const offsetY = startRow * ITEM_HEIGHT;

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
              onUpdateFormat={onUpdateFormat}
              onReformatItem={onReformatItem}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export const VirtualFileList = React.memo(VirtualFileListImpl);
