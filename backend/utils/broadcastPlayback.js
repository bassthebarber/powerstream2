/**
 * Compute synchronized "now playing" for 24/7 channels (MTV-style loop + schedule).
 */

export function minutesSinceMidnight(d = new Date()) {
  return d.getHours() * 60 + d.getMinutes();
}

function parseHHMM(s) {
  if (!s || typeof s !== "string") return 0;
  const parts = s.split(":");
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

/**
 * @param {Array<{ startTime: string, endTime: string, dayOfWeek?: number, videoIndex?: number, url?: string, slotTitle?: string }>} schedule
 */
export function activeScheduleSlot(schedule, now = new Date()) {
  if (!schedule?.length) return null;
  const dow = now.getDay();
  const mins = minutesSinceMidnight(now);
  for (const slot of schedule) {
    if (slot.dayOfWeek != null && Number(slot.dayOfWeek) !== dow) continue;
    const start = parseHHMM(slot.startTime);
    const end = parseHHMM(slot.endTime);
    if (end < start) {
      if (mins >= start || mins < end) return slot;
    } else if (mins >= start && mins < end) {
      return slot;
    }
  }
  return null;
}

/**
 * Wall-clock synced linear index: all viewers see the same item at the same time.
 */
export function cyclicPlaybackState(videos, loop, nowMs = Date.now()) {
  if (!videos?.length) {
    return {
      index: 0,
      offsetInBlockSeconds: 0,
      blockDurationSeconds: 0,
      cycleTotalSeconds: 0,
    };
  }
  const MIN_BLOCK = 120;
  const blocks = videos.map((v) =>
    Math.max(MIN_BLOCK, Number(v.durationSeconds) || 600)
  );
  const total = blocks.reduce((a, b) => a + b, 0);
  const daySec = Math.floor(nowMs / 1000) % 86400;
  let pos = daySec % total;
  if (!loop && videos.length > 0) {
    const days = Math.floor(nowMs / 1000 / 86400);
    pos = daySec + days * 86400;
    if (pos >= total) {
      return {
        index: videos.length - 1,
        offsetInBlockSeconds: blocks[blocks.length - 1],
        blockDurationSeconds: blocks[blocks.length - 1],
        cycleTotalSeconds: total,
        ended: true,
      };
    }
  }
  let acc = 0;
  for (let i = 0; i < blocks.length; i++) {
    if (pos < acc + blocks[i]) {
      return {
        index: i,
        offsetInBlockSeconds: pos - acc,
        blockDurationSeconds: blocks[i],
        cycleTotalSeconds: total,
      };
    }
    acc += blocks[i];
  }
  return {
    index: videos.length - 1,
    offsetInBlockSeconds: 0,
    blockDurationSeconds: blocks[blocks.length - 1],
    cycleTotalSeconds: total,
  };
}

export function nextIndex(currentIndex, len, loop) {
  if (len <= 0) return 0;
  const n = currentIndex + 1;
  if (n >= len) return loop ? 0 : -1;
  return n;
}

export function buildQueue(videos, fromIndex, loop) {
  if (!videos?.length) return [];
  const out = [];
  for (let i = 0; i < videos.length; i++) {
    const idx = (fromIndex + i) % videos.length;
    if (!loop && fromIndex + i >= videos.length) break;
    out.push({ ...videos[idx]._doc ?? videos[idx], queueIndex: idx });
    if (!loop && idx === videos.length - 1 && i > 0) break;
  }
  if (loop && videos.length > 1) {
    const rest = [];
    for (let k = 1; k < videos.length; k++) {
      const idx = (fromIndex + k) % videos.length;
      rest.push({ ...videos[idx]._doc ?? videos[idx], queueIndex: idx });
    }
    return rest;
  }
  const rest = [];
  for (let j = fromIndex + 1; j < videos.length; j++) {
    rest.push({ ...videos[j]._doc ?? videos[j], queueIndex: j });
  }
  if (loop && fromIndex < videos.length - 1) {
    for (let j = 0; j <= fromIndex; j++) {
      rest.push({ ...videos[j]._doc ?? videos[j], queueIndex: j });
    }
  } else if (loop && videos.length) {
    for (let j = 0; j < fromIndex; j++) {
      rest.push({ ...videos[j]._doc ?? videos[j], queueIndex: j });
    }
  }
  return rest;
}
