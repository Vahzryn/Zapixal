const fs = require('fs');
let code = fs.readFileSync('src/hooks/useBatchConversion.ts', 'utf8');

const startIdx = code.indexOf('const updateEtaMetrics = useCallback(() => {');
const endIdx = code.indexOf('}, []);', startIdx) + 7;

if (startIdx === -1 || endIdx === -1) {
  console.log("Could not find updateEtaMetrics");
  process.exit(1);
}

const replacement = `const updateEtaMetrics = useCallback(() => {
    const completedItems = completedBatchCountRef.current;
    const totalItems = totalBatchCountRef.current;
    
    if (completedItems === 0 || completedWorkloadRef.current === 0) {
      setEtaText('Estimating...');
      setProcessingSpeed('');
      return;
    }

    const elapsedMs = Math.max(1, Date.now() - batchStartTimeRef.current);
    const elapsedSeconds = elapsedMs / 1000;
    const remainingItems = totalItems - completedItems;

    if (remainingItems <= 0) {
      setEtaText('Almost done...');
      setProcessingSpeed('');
      return;
    }

    // Workload-based estimation
    const completedWork = completedWorkloadRef.current;
    const totalWork = totalWorkloadRef.current;
    const remainingWork = Math.max(0, totalWork - completedWork);
    
    // Observed throughput (work units per second)
    const currentThroughput = completedWork / elapsedSeconds;
    
    // Smoothing: maintain a history of throughputs to dampen wild swings
    let smoothedThroughput = currentThroughput;
    if (currentThroughput > 0) {
      const history = throughputHistoryRef.current;
      history.push(currentThroughput);
      if (history.length > 5) {
        history.shift();
      }
      smoothedThroughput = history.reduce((a, b) => a + b, 0) / history.length;
    }

    // Protect against division by zero or extremely low throughput
    let estimatedRemainingSec = 0;
    if (smoothedThroughput > 0.001) {
      estimatedRemainingSec = remainingWork / smoothedThroughput;
    } else {
      // Fallback to simple item-based if workload metrics are broken
      const itemsPerSec = completedItems / elapsedSeconds;
      estimatedRemainingSec = remainingItems / (itemsPerSec || 1);
    }
    
    // Cap wild fluctuations
    if (lastEtaSecRef.current !== null) {
       const prev = lastEtaSecRef.current;
       if (estimatedRemainingSec > prev * 1.5) {
         estimatedRemainingSec = prev * 1.5;
       } else if (estimatedRemainingSec < prev * 0.5) {
         estimatedRemainingSec = prev * 0.5;
       }
    }
    
    lastEtaSecRef.current = estimatedRemainingSec;
    const displaySec = Math.ceil(estimatedRemainingSec);

    let formattedTime = '';
    if (displaySec <= 5) {
      formattedTime = 'A few seconds left';
    } else if (displaySec < 60) {
      // Round to nearest 5 for stability if > 15
      let s = displaySec;
      if (s > 15) {
        s = Math.round(s / 5) * 5;
      }
      formattedTime = \`About \${s}s left\`;
    } else {
      const mins = Math.floor(displaySec / 60);
      const secs = displaySec % 60;
      
      // Keep it clean
      if (secs < 10) {
         formattedTime = \`About \${mins}m left\`;
      } else {
         let roundedSecs = Math.round(secs / 10) * 10;
         if (roundedSecs === 60) {
           formattedTime = \`About \${mins + 1}m left\`;
         } else {
           formattedTime = \`About \${mins}m \${roundedSecs}s left\`;
         }
      }
    }

    setEtaText(formattedTime);
    
    // Display friendly speed
    const itemsPerSec = completedItems / elapsedSeconds;
    setProcessingSpeed(\`\${itemsPerSec.toFixed(1)} items/s\`);
  }, []);`;

code = code.substring(0, startIdx) + replacement + code.substring(endIdx);
fs.writeFileSync('src/hooks/useBatchConversion.ts', code);
