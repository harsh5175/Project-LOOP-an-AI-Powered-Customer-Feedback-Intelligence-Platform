/**
 * In-memory sliding-window rate limiter for public API routes & form submissions.
 * Prevents spam abuse, brute force login attempts, and denial-of-service bursts.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up stale entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      record.timestamps = record.timestamps.filter((t) => now - t < 60_000);
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60_000);
}

export interface RateLimitOptions {
  limit?: number;        // Max allowed requests in interval
  windowMs?: number;     // Window size in milliseconds
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): { allowed: boolean; remaining: number; resetMs: number } {
  const limit = options.limit ?? 10;
  const windowMs = options.windowMs ?? 60_000;
  const now = Date.now();

  const record = rateLimitStore.get(identifier) ?? { timestamps: [] };
  // Keep only timestamps within window
  const validTimestamps = record.timestamps.filter((t) => now - t < windowMs);

  if (validTimestamps.length >= limit) {
    const oldest = validTimestamps[0];
    const resetMs = Math.max(0, windowMs - (now - oldest));
    return {
      allowed: false,
      remaining: 0,
      resetMs,
    };
  }

  validTimestamps.push(now);
  rateLimitStore.set(identifier, { timestamps: validTimestamps });

  return {
    allowed: true,
    remaining: limit - validTimestamps.length,
    resetMs: windowMs,
  };
}

/**
 * Validates bot protection honeypot and minimum human submission duration.
 */
export function validateBotProtection(data: {
  honeypot?: string;
  submissionStartedAt?: number;
  minDurationMs?: number;
}): { isBot: boolean; reason?: string } {
  // If honeypot is filled, it's a bot
  if (data.honeypot && data.honeypot.trim().length > 0) {
    return { isBot: true, reason: 'Honeypot trap triggered' };
  }

  // If submitted too fast (< 1000ms), it's automated script
  if (data.submissionStartedAt) {
    const duration = Date.now() - data.submissionStartedAt;
    const minDuration = data.minDurationMs ?? 1000;
    if (duration < minDuration) {
      return { isBot: true, reason: `Suspicious submission speed (${duration}ms)` };
    }
  }

  return { isBot: false };
}
