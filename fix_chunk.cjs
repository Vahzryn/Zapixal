const fs = require('fs');
let code = fs.readFileSync('src/hooks/useBatchConversion.ts', 'utf8');

const targetStr = `        const currentChunk = chunks[chunkIndex];
        completedBatchCountRef.current = 0;
        totalBatchCountRef.current = currentChunk.length;
        batchStartTimeRef.current = Date.now();`;

const replacementStr = `        const currentChunk = chunks[chunkIndex];
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
        totalWorkloadRef.current = chunkWorkload;`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/hooks/useBatchConversion.ts', code);
