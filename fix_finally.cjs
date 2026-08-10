const fs = require('fs');
let code = fs.readFileSync('src/hooks/useBatchConversion.ts', 'utf8');

const targetStr = `              const cost = estimateConversionMemoryCost(w, h, tf);`;
const replacementStr = `              const cost = estimateConversionMemoryCost(w, h, tf);
              const workCost = estimateProcessingWorkload(w, h, peekItem.file.type, tf);`;

code = code.replace(targetStr, replacementStr);

const targetStr2 = `                  activeMemory -= cost;
                  completedBatchCountRef.current++;
                  updateEtaMetrics();`;
const replacementStr2 = `                  activeMemory -= cost;
                  completedBatchCountRef.current++;
                  completedWorkloadRef.current += workCost;
                  updateEtaMetrics();`;

code = code.replace(targetStr2, replacementStr2);

fs.writeFileSync('src/hooks/useBatchConversion.ts', code);
