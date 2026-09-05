export const PROVIDER_CAPABILITIES = [
  {
    id: "ai",
    label: "文案模型",
    providerKey: "aiProvider",
    modelKey: "aiModel",
    apiKeyKey: "aiApiKey",
    endpointKey: "aiEndpoint",
    requiresApiKey: true,
    requiresEndpoint: true
  },
  {
    id: "image",
    label: "封面出图",
    providerKey: "imageProvider",
    modelKey: "visionModel",
    apiKeyKey: "imageApiKey",
    endpointKey: "imageEndpoint",
    requiresApiKey: true,
    requiresEndpoint: true
  },
  {
    id: "avatar",
    label: "数字人口播",
    providerKey: "avatarProvider",
    modelKey: "photoDriver",
    apiKeyKey: "avatarApiKey",
    endpointKey: "digitalHumanEndpoint",
    requiresApiKey: true,
    requiresEndpoint: true
  },
  {
    id: "edit",
    label: "智能剪辑",
    providerKey: "editProvider",
    modelKey: "defaultMode",
    apiKeyKey: "editApiKey",
    endpointKey: "editEndpoint",
    requiresApiKey: false,
    requiresEndpoint: false
  },
  {
    id: "publish",
    label: "平台发布",
    providerKey: "publishProvider",
    modelKey: "uiMode",
    apiKeyKey: "publishWebhook",
    endpointKey: "publishWebhook",
    requiresApiKey: false,
    requiresEndpoint: false
  }
];

export function getProviderMode(settings = {}) {
  return settings.providerMode === "real" ? "real" : "mock";
}

export function maskSecret(value = "") {
  if (!value) return "";
  if (value.length <= 8) return "****";
  return `${value.slice(0, 4)}****${value.slice(-4)}`;
}

export function buildProviderProfiles(settings = {}) {
  return PROVIDER_CAPABILITIES.map((capability) => ({
    ...capability,
    mode: getProviderMode(settings),
    provider: settings[capability.providerKey] || "未配置",
    model: settings[capability.modelKey] || "",
    apiKey: settings[capability.apiKeyKey] || "",
    endpoint: settings[capability.endpointKey] || ""
  }));
}

export function testProviderConnection(profile, settings = {}) {
  const mode = profile.mode || getProviderMode(settings);
  const checkedAt = new Date().toISOString();

  if (mode === "mock") {
    return {
      capabilityId: profile.id,
      status: "ready",
      checkedAt,
      message: "Mock 模式已启用，可使用本地模拟能力。"
    };
  }

  if (!profile.provider || profile.provider === "未配置") {
    return {
      capabilityId: profile.id,
      status: "failed",
      checkedAt,
      message: "缺少服务商配置。"
    };
  }

  if (profile.requiresApiKey && !profile.apiKey) {
    return {
      capabilityId: profile.id,
      status: "failed",
      checkedAt,
      message: "缺少 API Key。"
    };
  }

  if (profile.requiresEndpoint && !isValidEndpoint(profile.endpoint)) {
    return {
      capabilityId: profile.id,
      status: "failed",
      checkedAt,
      message: "缺少有效的服务地址。"
    };
  }

  if (profile.id === "publish" && !hasPublishTarget(settings)) {
    return {
      capabilityId: profile.id,
      status: "failed",
      checkedAt,
      message: "缺少发布账号或发布 Webhook。"
    };
  }

  return {
    capabilityId: profile.id,
    status: "ready",
    checkedAt,
    message: "配置校验通过，等待后端代理执行真实请求。",
    maskedKey: maskSecret(profile.apiKey)
  };
}

export function collectProviderStatuses(settings = {}) {
  return Object.fromEntries(
    buildProviderProfiles(settings).map((profile) => [profile.id, testProviderConnection(profile, settings)])
  );
}

export function buildProviderRequest(profile, action, payload = {}) {
  return {
    url: profile.endpoint,
    options: {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(profile.apiKey ? { authorization: `Bearer ${profile.apiKey}` } : {})
      },
      body: JSON.stringify({
        capability: profile.id,
        action,
        provider: profile.provider,
        model: profile.model,
        payload
      })
    }
  };
}

export async function invokeProvider(profile, action, payload = {}, options = {}) {
  const connection = testProviderConnection(profile, options.settings || {});

  if (connection.status === "failed") {
    const error = new Error(connection.message);
    error.connection = connection;
    throw error;
  }

  if ((profile.mode || "mock") === "mock") {
    return {
      status: "mocked",
      capabilityId: profile.id,
      action,
      data: payload
    };
  }

  const request = buildProviderRequest(profile, action, payload);
  const fetcher = options.fetcher || globalThis.fetch;
  if (typeof fetcher !== "function") {
    throw new Error("当前运行环境缺少 fetch，无法调用真实服务。");
  }

  return runWithRetry(
    async () => {
      const response = await fetcher(request.url, request.options);
      const data = await readResponseBody(response);

      if (!response.ok) {
        const error = new Error(data?.message || `真实服务请求失败：${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return {
        status: "ready",
        capabilityId: profile.id,
        action,
        data
      };
    },
    { retries: Number(options.retries ?? 2), delayMs: Number(options.delayMs ?? 0) }
  );
}

export async function runWithRetry(operation, options = {}) {
  const retries = Number.isFinite(options.retries) ? options.retries : 2;
  const delayMs = Number.isFinite(options.delayMs) ? options.delayMs : 0;
  let attempt = 0;
  let lastError;

  while (attempt <= retries) {
    try {
      return await operation({ attempt: attempt + 1 });
    } catch (error) {
      lastError = error;
      attempt += 1;
      if (attempt > retries) break;
      if (delayMs > 0) await wait(delayMs);
    }
  }

  lastError.attempts = attempt;
  throw lastError;
}

function isValidEndpoint(value = "") {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function hasPublishTarget(settings = {}) {
  const accounts = [settings.douyinAccount, settings.xiaohongshuAccount, settings.bilibiliAccount];
  return Boolean(settings.publishWebhook) || accounts.some((account) => account && account !== "未绑定");
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function readResponseBody(response) {
  const contentType = response.headers?.get?.("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
}
