import test from "node:test";
import assert from "node:assert/strict";
import { STORAGE_KEY, buildSnapshot, createMemoryStorage, readSnapshot, restoreList, writeSnapshot } from "../src/storage.js";

test("readSnapshot returns an empty object for missing or invalid data", () => {
  const storage = createMemoryStorage({ [STORAGE_KEY]: "{broken-json" });

  assert.deepEqual(readSnapshot(createMemoryStorage()), {});
  assert.deepEqual(readSnapshot(storage), {});
});

test("writeSnapshot stores serializable state", () => {
  const storage = createMemoryStorage();
  const snapshot = { projects: [{ id: "p1", name: "项目" }], settings: { theme: "dark" } };

  assert.equal(writeSnapshot(storage, snapshot), true);
  assert.deepEqual(readSnapshot(storage), snapshot);
});

test("restoreList uses fallback when stored list is empty or invalid", () => {
  const fallback = [{ id: "fallback" }];

  assert.deepEqual(restoreList([], fallback), fallback);
  assert.deepEqual(restoreList(undefined, fallback), fallback);
  assert.deepEqual(restoreList([{ id: "stored" }], fallback), [{ id: "stored" }]);
});

test("buildSnapshot keeps the core local data buckets", () => {
  const snapshot = buildSnapshot({
    projects: [{ id: "p1" }],
    assets: [{ id: "a1" }],
    historyItems: [{ id: "h1" }],
    topics: [{ id: "t1" }],
    scripts: [{ id: "s1" }],
    editTasks: [{ id: "e1" }],
    publishTasks: [{ id: "pub1" }],
    providerStatus: { ai: { status: "ready" } },
    settings: { aiProvider: "DeepSeek" },
    ui: { selectedProjectId: "p1" }
  });

  assert.equal(snapshot.projects[0].id, "p1");
  assert.equal(snapshot.assets[0].id, "a1");
  assert.equal(snapshot.historyItems[0].id, "h1");
  assert.equal(snapshot.topics[0].id, "t1");
  assert.equal(snapshot.scripts[0].id, "s1");
  assert.equal(snapshot.editTasks[0].id, "e1");
  assert.equal(snapshot.publishTasks[0].id, "pub1");
  assert.equal(snapshot.providerStatus.ai.status, "ready");
  assert.equal(snapshot.settings.aiProvider, "DeepSeek");
  assert.equal(snapshot.ui.selectedProjectId, "p1");
  assert.match(snapshot.savedAt, /^\d{4}-\d{2}-\d{2}T/);
});
