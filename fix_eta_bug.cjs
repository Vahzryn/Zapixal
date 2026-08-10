const fs = require('fs');
let code = fs.readFileSync('src/hooks/useBatchConversion.ts', 'utf8');

// 1. Update updateEtaMetrics to guarantee remainingWork > 0 when remainingItems > 0
const oldEtaMetrics = `    const completedWork = completedWorkloadRef.current;
    const totalWork = totalWorkloadRef.current;
    const remainingWork = Math.max(0, totalWork - completedWork);`;

const newEtaMetrics = `    const completedWork = completedWorkloadRef.current;
    const totalWork = totalWorkloadRef.current;
    const remainingWork = Math.max(remainingItems * 0.1, totalWork - completedWork);`;

code = code.replace(oldEtaMetrics, newEtaMetrics);

// 2. Fix batch initialization in processFiles to be batch-level rather than chunk-level
const oldChunkInit = `    const usedNamesInBatch = new Set<string>();

    try {
      for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
        if (abortControllerRef.current?.signal.aborted) break;
        
        const currentChunk = chunks[chunkIndex];
        completedBatchCountRef.current = 0;
        totalBatchCountRef.current = currentChunk.length;
        batchStartTimeRef.current = Date.now();
        lastEtaSecRef.current = null;
        throughputHistoryRef.current = [];
        completedWorkloadRef.current = 0;
        
        let chunkWorkload = 0;
        for (const item of currentChunk) {
           const tf = item.customTargetFormat || settings.targetFormat;
           const w = item.dimensions?.width || 2048;
           const h = item.dimensions?.height || 2048;
           chunkWorkload += estimateProcessingWorkload(w, h, item.file.type, tf);
        }
        totalWorkloadRef.current = chunkWorkload;
        setEtaText(runChunked ? \`Chunk \${chunkIndex + 1} of \${chunks.length}...\` : 'Calculating...');`;

const newChunkInit = `    const usedNamesInBatch = new Set<string>();

    completedBatchCountRef.current = 0;
    totalBatchCountRef.current = pendingFiles.length;
    batchStartTimeRef.current = Date.now();
    lastEtaSecRef.current = null;
    throughputHistoryRef.current = [];
    completedWorkloadRef.current = 0;

    let totalBatchWorkload = 0;
    for (const item of pendingFiles) {
       const tf = item.customTargetFormat || settings.targetFormat;
       const w = item.dimensions?.width || 2048;
       const h = item.dimensions?.height || 2048;
       totalBatchWorkload += estimateProcessingWorkload(w, h, item.file.type, tf);
    }
    totalWorkloadRef.current = totalBatchWorkload;
    setEtaText('Calculating...');

    try {
      for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
        if (abortControllerRef.current?.signal.aborted) break;
        
        const currentChunk = chunks[chunkIndex];
        if (chunkIndex > 0 && completedBatchCountRef.current > 0) {
          updateEtaMetrics();
        }`;

code = code.replace(oldChunkInit, newChunkInit);

fs.writeFileSync('src/hooks/useBatchConversion.ts', code);
