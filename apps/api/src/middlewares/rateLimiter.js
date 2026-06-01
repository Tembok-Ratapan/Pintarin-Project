const { errorResponse } = require("../utils/apiResponse");

const defaultKeyGenerator = (req) => req.ip || req.socket?.remoteAddress || "unknown";

const createRateLimiter = ({
  windowMs,
  max,
  keyGenerator = defaultKeyGenerator,
  message = "Too many requests. Please try again later.",
}) => {
  const buckets = new Map();
  let lastCleanupAt = Date.now();

  return (req, res, next) => {
    if (max <= 0 || windowMs <= 0) {
      return next();
    }

    const now = Date.now();

    if (now - lastCleanupAt > windowMs) {
      buckets.forEach((bucket, bucketKey) => {
        if (bucket.resetAt <= now) {
          buckets.delete(bucketKey);
        }
      });
      lastCleanupAt = now;
    }

    const key = keyGenerator(req) || "unknown";
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });

      res.setHeader("X-RateLimit-Limit", String(max));
      res.setHeader("X-RateLimit-Remaining", String(Math.max(max - 1, 0)));
      res.setHeader("X-RateLimit-Reset", String(Math.ceil((now + windowMs) / 1000)));

      return next();
    }

    bucket.count += 1;

    const remaining = Math.max(max - bucket.count, 0);
    const retryAfterSeconds = Math.max(
      Math.ceil((bucket.resetAt - now) / 1000),
      1,
    );

    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(remaining));
    res.setHeader("X-RateLimit-Reset", String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count > max) {
      res.setHeader("Retry-After", String(retryAfterSeconds));

      return errorResponse(res, {
        statusCode: 429,
        message,
      });
    }

    return next();
  };
};

const getIdentifierKey = (req) => {
  const identifier = String(req.body?.identifier || "anonymous")
    .trim()
    .toLowerCase();

  return `${defaultKeyGenerator(req)}:${identifier}`;
};

module.exports = {
  createRateLimiter,
  defaultKeyGenerator,
  getIdentifierKey,
};
