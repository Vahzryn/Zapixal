const fs = require('fs');
let code = fs.readFileSync('src/hooks/useBatchConversion.ts', 'utf8');

const targetStr = `    let currentIndex = 0;
    let activeWorkers = 0;
    let activeMemory = 0;
    const memoryBudget = estimateDeviceMemoryBudget(hardware);
    const maxMemory = memoryBudget.safeWorkingBytes;
    const usedNamesInBatch = new Set<string>();`;

const replacementStr = `    let currentIndex = 0;
    let activeWorkers = 0;
    let activeMemory = 0;
    const memoryBudget = estimateDeviceMemoryBudget(hardware);
    const maxMemory = memoryBudget.safeWorkingBytes;
    const usedNamesInBatch = new Set<string>();
    
    completedBatchCountRef.current = 0;
    totalBatchCountRef.current = itemsToReformat.length;
    batchStartTimeRef.current = Date.now();
    lastEtaSecRef.current = null;
    throughputHistoryRef.current = [];
    completedWorkloadRef.current = 0;
    
    let reformatWorkload = 0;
    for (const item of itemsToReformat) {
       const w = item.dimensions?.width || 2048;
       const h = item.dimensions?.height || 2048;
       reformatWorkload += estimateProcessingWorkload(w, h, item.file.type, newFormat);
    }
    totalWorkloadRef.current = reformatWorkload;`;

code = code.replace(targetStr, replacementStr);

const targetStrCost = `          const cost = estimateConversionMemoryCost(w, h, newFormat);`;
const replacementStrCost = `          const cost = estimateConversionMemoryCost(w, h, newFormat);
          const workCost = estimateProcessingWorkload(w, h, peekItem.file.type, newFormat);`;

code = code.replace(targetStrCost, replacementStrCost);

const targetStrFinally = `              activeMemory -= cost;
              if (typeof (globalThis as any).scheduler?.yield === 'function') {`;
const replacementStrFinally = `              activeMemory -= cost;
              completedBatchCountRef.current++;
              completedWorkloadRef.current += workCost;
              updateEtaMetrics();
              if (typeof (globalThis as any).scheduler?.yield === 'function') {`;

code = code.replace(targetStrFinally, replacementStrFinally);

fs.writeFileSync('src/hooks/useBatchConversion.ts', code);
