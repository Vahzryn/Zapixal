const fs = require('fs');
let code = fs.readFileSync('src/hooks/useBatchConversion.ts', 'utf8');
code = code.replace(
  /const totalBatchCountRef = useRef<number>\(0\);/,
  `const totalBatchCountRef = useRef<number>(0);
  const completedWorkloadRef = useRef<number>(0);
  const totalWorkloadRef = useRef<number>(0);
  const throughputHistoryRef = useRef<number[]>([]);
  const lastEtaSecRef = useRef<number | null>(null);`
);
fs.writeFileSync('src/hooks/useBatchConversion.ts', code);
