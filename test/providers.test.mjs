import test from "node:test";
import assert from "node:assert/strict";
import {
  buildProviderProfiles,
  collectProviderStatuses,
  maskSecret,
  runWithRetry,
  testProviderConnection
} from "../src/providers.js";

test("buildProviderProfiles maps settings into provider capabilities", () => {
  const profiles = buildProviderProfiles({
    providerMode: "real",
    aiProvider: "DeepSeek",
    aiModel: "deepseek-v4-flash",
    aiApiKey: "sk-1234567890",
    aiEndpoint: "https://api.example.com"
  });

  const ai = profiles.find((profile) => profile.id === "ai");

  assert.equal(profiles.length, 5);
  assert.equal(ai.provider, "DeepSeek");
  assert.equal(ai.mode, "real");
});

test("testProviderConnection lets mock mode run without credentials", () => {
  const [profile] = buildProviderProfiles({ providerMode: "mock" });
  const result = testProviderConnection(profile);

  assert.equal(result.status, "ready");
  assert.match(result.message, /Mock/);
});

test("testProviderConnection fails real mode when api key is missing", () => {
  const [profile] = buildProviderProfiles({
    providerMode: "real",
    aiProvider: "DeepSeek",
    aiEndpoint: "https://api.example.com"
  });
  const result = testProviderConnection(profile);

  assert.equal(result.status, "failed");
  assert.match(result.message, /API Key/);
});

test("testProviderConnection fails real mode when endpoint is invalid", () => {
  const [profile] = buildProviderProfiles({
    providerMode: "real",
    aiProvider: "DeepSeek",
    aiApiKey: "sk-1234567890",
    aiEndpoint: "not-a-url"
  });
  const result = testProviderConnection(profile);

  assert.equal(result.status, "failed");
  assert.match(result.message, /服务地址/);
});

test("collectProviderStatuses marks configured real providers as ready", () => {
  const results = collectProviderStatuses({
    providerMode: "real",
    aiProvider: "DeepSeek",
    aiModel: "deepseek-v4-flash",
    aiApiKey: "sk-1234567890",
    aiEndpoint: "https://api.example.com",
    imageProvider: "CogView",
    imageApiKey: "img-1234567890",
    imageEndpoint: "https://image.example.com",
    avatarProvider: "Avatar",
    photoDriver: "photo",
    avatarApiKey: "avatar-1234567890",
    digitalHumanEndpoint: "https://avatar.example.com",
    editProvider: "Local Remotion",
    publishProvider: "Webhook",
    publishWebhook: "https://publish.example.com"
  });

  assert.equal(results.ai.status, "ready");
  assert.equal(results.image.status, "ready");
  assert.equal(results.avatar.status, "ready");
  assert.equal(results.edit.status, "ready");
  assert.equal(results.publish.status, "ready");
});

test("maskSecret keeps only secret edges visible", () => {
  assert.equal(maskSecret("sk-1234567890"), "sk-1****7890");
  assert.equal(maskSecret("short"), "****");
});

test("runWithRetry retries failed provider operations", async () => {
  let calls = 0;
  const result = await runWithRetry(async () => {
    calls += 1;
    if (calls < 2) throw new Error("temporary");
    return "ok";
  });

  assert.equal(result, "ok");
  assert.equal(calls, 2);
});
