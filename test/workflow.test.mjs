import test from "node:test";
import assert from "node:assert/strict";
import { assets } from "../src/mockData.js";
import {
  runEditStep,
  runProviderBackedStep,
  runPublishStep,
  runScriptStep,
  runTopicStep,
  testWorkflowConnections
} from "../src/workflow.js";

test("runTopicStep creates three scored topic ideas from a seed", () => {
  const topics = runTopicStep("探店");

  assert.equal(topics.length, 3);
  assert.ok(topics.every((topic) => topic.title.includes("探店")));
  assert.ok(topics.every((topic) => topic.score >= 80));
});

test("runScriptStep creates title options and storyboard", () => {
  const [topic] = runTopicStep("本地生活");
  const script = runScriptStep(topic);

  assert.equal(script.topicTitle, topic.title);
  assert.equal(script.titleOptions.length, 3);
  assert.equal(script.storyboard.length, 3);
});

test("runEditStep creates a ready mock edit task", () => {
  const project = { id: "p1", name: "测试项目" };
  const task = runEditStep(project, assets);

  assert.equal(task.projectId, "p1");
  assert.equal(task.status, "ready");
  assert.match(task.outputPath, /测试项目-mock\.mp4$/);
});

test("runPublishStep creates a publish package for common platforms", () => {
  const project = { id: "p1", name: "测试项目" };
  const [topic] = runTopicStep("探店");
  const script = runScriptStep(topic);
  const editTask = runEditStep(project, assets);
  const publishPackage = runPublishStep(project, script, editTask);

  assert.equal(publishPackage.projectId, "p1");
  assert.equal(publishPackage.status, "ready");
  assert.ok(publishPackage.platforms.includes("抖音"));
  assert.equal(publishPackage.videoPath, editTask.outputPath);
});

test("testWorkflowConnections checks each provider capability", () => {
  const results = testWorkflowConnections({ providerMode: "mock" });

  assert.equal(results.ai.status, "ready");
  assert.equal(results.image.status, "ready");
  assert.equal(results.avatar.status, "ready");
  assert.equal(results.edit.status, "ready");
  assert.equal(results.publish.status, "ready");
});

test("runProviderBackedStep invokes the selected provider capability", async () => {
  const result = await runProviderBackedStep("ai", "generate-topic", { seed: "餐饮" }, { providerMode: "mock" });

  assert.equal(result.status, "mocked");
  assert.equal(result.capabilityId, "ai");
  assert.equal(result.data.seed, "餐饮");
});
