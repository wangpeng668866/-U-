import test from "node:test";
import assert from "node:assert/strict";
import { assets } from "../src/mockData.js";
import { createProject, filterAssets, generateScriptPreview, getProjectProgress, getStatusLabel } from "../src/domain.js";

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
