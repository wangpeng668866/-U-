import test from "node:test";
import assert from "node:assert/strict";
import { assets } from "../src/mockData.js";
import {
  createMockEditTask,
  createMockPublishPackage,
  createMockScript,
  createProject,
  filterAssets,
  generateMockTopics,
  generateScriptPreview,
  getProjectProgress,
  getStatusLabel
} from "../src/domain.js";

test("filterAssets filters by category, type, and query", () => {
  const result = filterAssets(assets, {
    category: "餐饮美食",
    type: "image",
    query: "菜品"
  });

  assert.equal(result.length, 1);
  assert.equal(result[0].name, "中式菜品摆盘");
});

test("getProjectProgress marks previous, current, and future steps", () => {
  const progress = getProjectProgress("剪辑");

  assert.deepEqual(
    progress.map((step) => step.state),
    ["done", "done", "done", "active", "idle", "idle"]
  );
});

test("createProject validates name and creates a draft project", () => {
  assert.throws(() => createProject("   "), /项目名称不能为空/);

  const project = createProject("新项目", "edit");
  assert.equal(project.name, "新项目");
  assert.equal(project.mode, "edit");
  assert.equal(project.status, "draft");
});

test("getStatusLabel handles known and unknown statuses", () => {
  assert.equal(getStatusLabel("ready"), "已就绪");
  assert.equal(getStatusLabel("missing"), "未知");
});

test("generateScriptPreview returns the core script sections", () => {
  const script = generateScriptPreview({ title: "探店视频为什么开头 3 秒决定完播" });

  assert.equal(script.title, "探店视频为什么开头 3 秒决定完播");
  assert.ok(script.hook.includes("探店视频"));
  assert.ok(script.body.includes("第一步"));
  assert.ok(script.ending.includes("批量做出来"));
});

test("generateMockTopics creates a scored topic set", () => {
  const topics = generateMockTopics("餐饮");

  assert.equal(topics.length, 3);
  assert.ok(topics.every((topic) => topic.title.includes("餐饮")));
  assert.ok(topics.every((topic) => topic.score >= 80));
});

test("createMockScript creates titles and storyboard shots", () => {
  const [topic] = generateMockTopics("知识付费");
  const script = createMockScript(topic);

  assert.equal(script.topicTitle, topic.title);
  assert.equal(script.titleOptions.length, 3);
  assert.equal(script.storyboard.length, 3);
});

test("createMockEditTask creates a ready export task", () => {
  const task = createMockEditTask({ id: "p1", name: "项目A" }, assets);

  assert.equal(task.projectId, "p1");
  assert.equal(task.status, "ready");
  assert.match(task.outputPath, /项目A-mock\.mp4$/);
});

test("createMockPublishPackage creates a platform publish bundle", () => {
  const [topic] = generateMockTopics("探店");
  const script = createMockScript(topic);
  const editTask = createMockEditTask({ id: "p1", name: "项目A" }, assets);
  const publishPackage = createMockPublishPackage({ id: "p1", name: "项目A" }, script, editTask);

  assert.equal(publishPackage.projectId, "p1");
  assert.equal(publishPackage.videoPath, editTask.outputPath);
  assert.ok(publishPackage.platforms.includes("抖音"));
});
