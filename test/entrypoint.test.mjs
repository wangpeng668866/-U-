import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("index uses a classic script so the app can open from file URLs", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

  assert.match(html, /<script src="\.\/src\/app\.js"><\/script>/);
  assert.doesNotMatch(html, /type="module"/);
});

test("index shows a visible startup fallback before JavaScript renders", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

  assert.match(html, /class="boot-fallback"/);
  assert.match(html, /鹏程短视频智能体/);
  assert.match(html, /应用正在启动/);
});

test("browser entrypoint is self-contained and does not depend on module imports", async () => {
  const app = await readFile(new URL("../src/app.js", import.meta.url), "utf8");

  assert.doesNotMatch(app, /^import\s/m);
  assert.match(app, /function render\(\)/);
});

test("browser entrypoint uses an inline project form instead of prompt dialogs", async () => {
  const app = await readFile(new URL("../src/app.js", import.meta.url), "utf8");

  assert.doesNotMatch(app, /window\.prompt/);
  assert.match(app, /id="newProjectForm"/);
  assert.match(app, /id="newProjectName"/);
  assert.match(app, /id="confirmNewProject"/);
});

test("browser entrypoint includes provider connection controls", async () => {
  const app = await readFile(new URL("../src/app.js", import.meta.url), "utf8");

  assert.match(app, /function testProviderConnection/);
  assert.match(app, /id="testAllProviders"/);
  assert.match(app, /data-test-provider/);
});
