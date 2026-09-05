import { buildProviderProfiles, invokeProvider, testProviderConnection } from "./providers.js";

export async function handleProviderApiRequest(request, response, options = {}) {
  try {
    const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

    if (request.method !== "POST") {
      sendJson(response, 405, { ok: false, message: "Only POST is supported." });
      return true;
    }

    if (url.pathname === "/api/provider/test") {
      const body = await readJsonBody(request);
      const result = testProviderSettings(body.settings || {}, body.capabilityId);
      sendJson(response, result.ok ? 200 : 422, result);
      return true;
    }

    if (url.pathname === "/api/provider/invoke") {
      const body = await readJsonBody(request);
      const result = await invokeProviderAction(body, options);
      sendJson(response, 200, { ok: true, result });
      return true;
    }

    return false;
  } catch (error) {
    sendJson(response, error.status || 500, {
      ok: false,
      message: error.message || "Provider API request failed.",
      connection: error.connection
        ? {
            capabilityId: error.connection.capabilityId,
            mode: error.connection.mode,
            status: error.connection.status,
            message: error.connection.message
          }
        : undefined
    });
    return true;
  }
}

export function testProviderSettings(settings = {}, capabilityId) {
  const profiles = buildProviderProfiles(settings).filter((profile) => !capabilityId || profile.id === capabilityId);
  const results = Object.fromEntries(
    profiles.map((profile) => [profile.id, testProviderConnection(profile, settings)])
  );
  const failedCount = Object.values(results).filter((result) => result.status === "failed").length;

  return {
    ok: failedCount === 0,
    failedCount,
    results
  };
}

export async function invokeProviderAction(body = {}, options = {}) {
  const { settings = {}, capabilityId, action, payload = {} } = body;
  if (!capabilityId) throw new Error("缺少 capabilityId。");
  if (!action) throw new Error("缺少 action。");

  const profile = buildProviderProfiles(settings).find((item) => item.id === capabilityId);
  if (!profile) throw new Error(`未知能力：${capabilityId}`);

  return invokeProvider(profile, action, payload, {
    settings,
    fetcher: options.fetcher,
    retries: settings.maxRetries === undefined ? 2 : Number(settings.maxRetries),
    delayMs: 0
  });
}

async function readJsonBody(request) {
  let raw = "";

  for await (const chunk of request) {
    raw += chunk;
    if (raw.length > 1024 * 1024) {
      throw new Error("请求体过大。");
    }
  }

  if (!raw.trim()) return {};
  return JSON.parse(raw);
}

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    "cache-control": "no-store",
    "content-type": "application/json; charset=utf-8"
  });
  response.end(JSON.stringify(body));
}
