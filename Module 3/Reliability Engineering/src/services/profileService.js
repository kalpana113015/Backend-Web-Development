const DEFAULT_AVATAR = {
  url: 'https://cdn.aurora-profiles.dev/avatars/default.png',
  initials: '?',
  source: 'fallback',
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isRetryable(error) {
  if (!error) return false;

  if (error.name === 'AbortError') {
    return true;
  }

  const status = error.status ?? error.statusCode ?? error.response?.status;
  if (status === undefined || status === null) {
    return true;
  }

  const numericStatus = Number(status);
  if (Number.isNaN(numericStatus)) {
    return true;
  }

  if (numericStatus === 429) {
    return true;
  }

  if (numericStatus >= 500 && numericStatus < 600) {
    return true;
  }

  if (numericStatus >= 400 && numericStatus < 500) {
    return false;
  }

  return false;
}

async function withTimeout(operation, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    return await operation(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}

async function withRetry(operation, options = {}) {
  const maxAttempts = Number(options.maxAttempts) > 0 ? Number(options.maxAttempts) : 3;
  const baseDelayMs = options.baseDelayMs !== undefined ? Number(options.baseDelayMs) : 25;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (!isRetryable(error) || attempt === maxAttempts - 1) {
        throw error;
      }
      await sleep(baseDelayMs * (2 ** attempt));
    }
  }
}

async function getProfileWithAvatar(authorId, avatarClient, options = {}) {
  const timeoutMs = options.timeoutMs || 200;
  const maxAttempts = options.maxAttempts || 3;
  const baseDelayMs = options.baseDelayMs || 25;

  try {
    const avatar = await withRetry(
      () => withTimeout(signal => avatarClient.getAvatar(authorId, { signal }), timeoutMs),
      { maxAttempts, baseDelayMs }
    );
    return { authorId, avatar, degraded: false };
  } catch (error) {
    return { authorId, avatar: DEFAULT_AVATAR, degraded: true };
  }
}

module.exports = {
  DEFAULT_AVATAR,
  sleep,
  isRetryable,
  withTimeout,
  withRetry,
  getProfileWithAvatar,
};
