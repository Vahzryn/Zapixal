import assert from 'node:assert';

class EtaTracker {
  batchStartTime: number = 0;
  completedItems: number = 0;
  totalItems: number = 0;
  completedWorkload: number = 0;
  totalWorkload: number = 0;
  lastEtaSec: number | null = null;
  recentWorkSamples: { timestamp: number; work: number }[] = [];
  formattedEta: string = '';

  startBatch(totalItems: number, totalWorkload: number, now: number = Date.now()) {
    this.batchStartTime = now;
    this.completedItems = 0;
    this.totalItems = totalItems;
    this.completedWorkload = 0;
    this.totalWorkload = totalWorkload;
    this.lastEtaSec = null;
    this.recentWorkSamples = [];
    this.formattedEta = 'Calculating...';
  }

  recordJobCompletion(workCost: number, now: number = Date.now()) {
    this.completedItems++;
    this.completedWorkload += workCost;
    this.recentWorkSamples.push({ timestamp: now, work: workCost });
    return this.updateEtaMetrics(now);
  }

  updateEtaMetrics(now: number = Date.now()): number {
    if (this.completedItems === 0 || this.completedWorkload === 0) {
      this.formattedEta = 'Estimating...';
      return Infinity;
    }

    const elapsedMs = Math.max(1, now - this.batchStartTime);
    const elapsedSeconds = elapsedMs / 1000;
    const remainingItems = this.totalItems - this.completedItems;

    if (remainingItems <= 0) {
      this.formattedEta = 'Almost done...';
      return 0;
    }

    const completedWork = this.completedWorkload;
    const totalWork = this.totalWorkload;
    const remainingWork = Math.max(remainingItems * 0.1, totalWork - completedWork);

    const longTermThroughput = completedWork / elapsedSeconds;

    // Keep at most 7 recent samples and prune older than 6000ms
    this.recentWorkSamples = this.recentWorkSamples.filter(s => now - s.timestamp <= 6000);
    if (this.recentWorkSamples.length > 7) {
      this.recentWorkSamples = this.recentWorkSamples.slice(-7);
    }
    const samples = this.recentWorkSamples;

    let shortTermThroughput = longTermThroughput;
    if (samples.length >= 2) {
      const windowDurationSec = Math.max(0.1, (now - samples[0].timestamp) / 1000);
      const recentWorkSum = samples.slice(1).reduce((sum, s) => sum + s.work, 0);
      shortTermThroughput = recentWorkSum / windowDurationSec;
    } else if (samples.length === 1) {
      const windowDurationSec = Math.max(0.1, (now - this.batchStartTime) / 1000);
      shortTermThroughput = samples[0].work / windowDurationSec;
    }

    const divergence = Math.abs(shortTermThroughput - longTermThroughput) / Math.max(0.001, longTermThroughput);

    const alpha = Math.min(0.85, 0.3 + 0.55 * Math.min(1.0, divergence));
    const effectiveThroughput = alpha * shortTermThroughput + (1 - alpha) * longTermThroughput;

    let estimatedRemainingSec = 0;
    if (effectiveThroughput > 0.001) {
      estimatedRemainingSec = remainingWork / effectiveThroughput;
    } else {
      const itemsPerSec = this.completedItems / elapsedSeconds;
      estimatedRemainingSec = remainingItems / (itemsPerSec || 1);
    }

    if (this.lastEtaSec !== null) {
      const prev = this.lastEtaSec;
      const maxIncreaseFactor = 1.5 + 2.5 * Math.min(1.0, divergence);
      const minDecreaseFactor = Math.max(0.1, 0.5 - 0.4 * Math.min(1.0, divergence));

      if (estimatedRemainingSec > prev * maxIncreaseFactor) {
        estimatedRemainingSec = prev * maxIncreaseFactor;
      } else if (estimatedRemainingSec < prev * minDecreaseFactor) {
        estimatedRemainingSec = prev * minDecreaseFactor;
      }
    }

    this.lastEtaSec = estimatedRemainingSec;
    const displaySec = Math.ceil(estimatedRemainingSec);

    if (displaySec <= 5) {
      this.formattedEta = 'A few seconds left';
    } else if (displaySec < 60) {
      let s = displaySec;
      if (s > 15) {
        s = Math.round(s / 5) * 5;
      }
      this.formattedEta = `About ${s}s left`;
    } else {
      const mins = Math.floor(displaySec / 60);
      const secs = displaySec % 60;
      if (secs < 10) {
        this.formattedEta = `About ${mins}m left`;
      } else {
        let roundedSecs = Math.round(secs / 10) * 10;
        if (roundedSecs === 60) {
          this.formattedEta = `About ${mins + 1}m left`;
        } else {
          this.formattedEta = `About ${mins}m ${roundedSecs}s left`;
        }
      }
    }

    return estimatedRemainingSec;
  }
}

console.log('Running Adaptive ETA Simulation Tests...\n');

// CASE A: Speeding Up (Slow early -> Fast later)
{
  const tracker = new EtaTracker();
  let currentTime = 1000000;
  tracker.startBatch(50, 50, currentTime);

  for (let i = 0; i < 5; i++) {
    currentTime += 2000;
    tracker.recordJobCompletion(1, currentTime);
  }
  const slowEta = tracker.lastEtaSec!;
  assert(slowEta > 60, `Slow phase ETA should be high (>60s), got ${slowEta}`);

  for (let i = 0; i < 5; i++) {
    currentTime += 100;
    tracker.recordJobCompletion(1, currentTime);
  }
  const fastEta = tracker.lastEtaSec!;

  assert(fastEta < slowEta / 3, `ETA should drop rapidly on speedup (was ${slowEta}s, now ${fastEta}s)`);
  console.log('✓ CASE A — Speeding up test passed (ETA adjusted from ' + Math.round(slowEta) + 's to ' + Math.round(fastEta) + 's)');
}

// CASE B: Slowing Down (Fast early -> Slow later)
{
  const tracker = new EtaTracker();
  let currentTime = 1000000;
  tracker.startBatch(50, 50, currentTime);

  for (let i = 0; i < 10; i++) {
    currentTime += 100;
    tracker.recordJobCompletion(1, currentTime);
  }
  const fastEta = tracker.lastEtaSec!;
  assert(fastEta < 10, `Fast phase ETA should be low (<10s), got ${fastEta}`);

  for (let i = 0; i < 2; i++) {
    currentTime += 4000;
    tracker.recordJobCompletion(1, currentTime);
  }
  const slowEta = tracker.lastEtaSec!;

  assert(slowEta > fastEta * 3, `ETA should increase rapidly on slowdown (was ${fastEta}s, now ${slowEta}s)`);
  console.log('✓ CASE B — Slowing down test passed (ETA adjusted from ' + Math.round(fastEta) + 's to ' + Math.round(slowEta) + 's)');
}

// CASE C: Stable Performance
{
  const tracker = new EtaTracker();
  let currentTime = 1000000;
  tracker.startBatch(20, 20, currentTime);

  const etas: number[] = [];
  for (let i = 0; i < 15; i++) {
    currentTime += 1000;
    tracker.recordJobCompletion(1, currentTime);
    etas.push(tracker.lastEtaSec!);
  }

  for (let i = 1; i < etas.length; i++) {
    assert(etas[i] <= etas[i - 1] + 0.1, `ETA should decrease or remain steady on stable processing (${etas[i-1]}s -> ${etas[i]}s)`);
  }
  console.log('✓ CASE C — Stable performance test passed (Monotonically decreasing ETA)');
}

// CASE D: Format Change (JPEG fast -> AVIF slow)
{
  const tracker = new EtaTracker();
  let currentTime = 1000000;
  tracker.startBatch(20, 50, currentTime);

  for (let i = 0; i < 5; i++) {
    currentTime += 200;
    tracker.recordJobCompletion(1, currentTime);
  }
  const jpegEta = tracker.lastEtaSec!;

  for (let i = 0; i < 3; i++) {
    currentTime += 3000;
    tracker.recordJobCompletion(4, currentTime);
  }
  const avifEta = tracker.lastEtaSec!;

  assert(avifEta > jpegEta * 1.8, `ETA should adjust upward for heavier format workload (${jpegEta}s -> ${avifEta}s)`);
  console.log('✓ CASE D — Format change test passed (JPEG ' + Math.round(jpegEta) + 's -> AVIF ' + Math.round(avifEta) + 's)');
}

// CASE E: Concurrency Drop (4 workers -> 1 worker)
{
  const tracker = new EtaTracker();
  let currentTime = 1000000;
  tracker.startBatch(40, 40, currentTime);

  for (let i = 0; i < 8; i += 4) {
    currentTime += 1000;
    tracker.recordJobCompletion(1, currentTime);
    tracker.recordJobCompletion(1, currentTime);
    tracker.recordJobCompletion(1, currentTime);
    tracker.recordJobCompletion(1, currentTime);
  }
  const parallelEta = tracker.lastEtaSec!;

  for (let i = 0; i < 3; i++) {
    currentTime += 2000;
    tracker.recordJobCompletion(1, currentTime);
  }
  const throttledEta = tracker.lastEtaSec!;

  assert(throttledEta > parallelEta * 2, `ETA should adapt to worker concurrency reduction (${parallelEta}s -> ${throttledEta}s)`);
  console.log('✓ CASE E — Concurrency change test passed (4 workers ' + Math.round(parallelEta) + 's -> 1 worker ' + Math.round(throttledEta) + 's)');
}

// CASE F: Chunk Boundary Preservation
{
  const tracker = new EtaTracker();
  let currentTime = 1000000;
  tracker.startBatch(20, 20, currentTime);

  for (let i = 0; i < 5; i++) {
    currentTime += 1000;
    tracker.recordJobCompletion(1, currentTime);
  }
  const etaBeforeChunkEnd = tracker.lastEtaSec!;

  currentTime += 200;
  const etaAtChunkStart = tracker.updateEtaMetrics(currentTime);

  assert(tracker.completedItems === 5, 'Completed count must be preserved across chunks');
  assert(Math.abs(etaAtChunkStart - etaBeforeChunkEnd) < 2, `ETA must not reset at chunk boundary (${etaBeforeChunkEnd}s vs ${etaAtChunkStart}s)`);
  assert(tracker.formattedEta !== 'Estimating...' && tracker.formattedEta !== '0s', 'Formatted ETA must remain continuous');
  console.log('✓ CASE F — Chunk boundary test passed (Preserved continuous ETA across chunk switch)');
}

console.log('\nAll adaptive ETA tests passed successfully!');
