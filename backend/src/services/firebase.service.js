const { adminMessaging } = require("../config/firebaseAdmin");

// Token errors that mean "this device will never receive another push" —
// safe to clear from the owning document so future sends don't keep hitting them.
const DEAD_TOKEN_ERRORS = new Set([
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token",
  "messaging/invalid-argument",
]);

/**
 * Sends one push notification to a batch of FCM device tokens.
 *
 * @param {string[]} tokens - up to 500 FCM registration tokens (Firebase's
 *   per-call limit for sendEachForMulticast — callers with more should chunk).
 * @param {Object} payload
 * @param {string} payload.title
 * @param {string} payload.body
 * @param {Object} [payload.data] - string-only key/value pairs for deep-linking
 *   in the Flutter app (FCM requires all `data` values to be strings).
 * @param {boolean} [dryRun=false] - validate without actually delivering.
 * @returns {Promise<{results: Array<{token, success, error}>, deadTokens: string[]}>}
 */
async function sendPushToTokens(tokens, { title, body, data = {} }, dryRun = false) {
  const cleanTokens = [...new Set(tokens.filter(Boolean))];
  if (cleanTokens.length === 0) {
    return { results: [], deadTokens: [] };
  }

  const stringData = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, String(v)])
  );

  const message = {
    tokens: cleanTokens,
    notification: { title, body },
    data: stringData,
  };

  const response = await adminMessaging.sendEachForMulticast(message, dryRun);

  const results = [];
  const deadTokens = [];
  response.responses.forEach((r, i) => {
    const token = cleanTokens[i];
    if (r.success) {
      results.push({ token, success: true });
    } else {
      const code = r.error?.code;
      results.push({ token, success: false, error: code || r.error?.message });
      if (DEAD_TOKEN_ERRORS.has(code)) deadTokens.push(token);
    }
  });

  return { results, deadTokens };
}

module.exports = { sendPushToTokens };
