import test from "node:test";
import assert from "node:assert/strict";
import { invokeProviderAction, testProviderSettings } from "../src/providerApi.js";

test("testProviderSettings checks all provider capabilities", () => {
  const result = testProviderSettings({ providerMode: "mock" });

  assert.equal(result.ok, true);
  assert.equal(result.failedCount, 0);
  assert.equal(result.results.ai.status, "ready");
  assert.equal(result.results.publish.status, "ready");
});

test("testProviderSettings can check one provider capability", () => {
  const result = testProviderSettings({ providerMode: "real", aiProvider: "DeepSeek" }, "ai");

  assert.equal(result.ok, false);
  assert.equal(result.failedCount, 1);
  assert.equal(Object.keys(result.results).length, 1);
  assert.equal(result.results.ai.status, "failed");
});

test("invokeProviderAction runs mock provider actions through the API layer", async () => {
  const result = await invokeProviderAction({
    settings: { providerMode: "mock" },
    capabilityId: "ai",
    action: "generate-topic",
    payload: { seed: "餐饮" }
  });

  assert.equal(result.status, "mocked");
  assert.equal(result.capabilityId, "ai");
  assert.equal(result.data.seed, "餐饮");
});

test("invokeProviderAction forwards real provider calls to an injected fetcher", async () => {
  const calls = [];
  const result = await invokeProviderAction(
    {
      settings: {
        providerMode: "real",
        aiProvider: "DeepSeek",
        aiModel: "deepseek-v4-flash",
        aiApiKey: "sk-1234567890",
        aiEndpoint: "https://api.example.com/workflow",
        maxRetries: 0
      },
      capabilityId: "ai",
      action: "generate-script",
      payload: { topic: "探店" }
    },
    {
      fetcher: async (url, options) => {
        calls.push({ url, options });
        return {
          ok: true,
          status: 200,
          headers: new Map([["content-type", "application/json"]]),
          json: async () => ({ text: "ok" })
        };
      }
    }
  );

  assert.equal(result.status, "ready");
  assert.equal(result.data.text, "ok");
  assert.equal(calls[0].url, "https://api.example.com/workflow");
});
