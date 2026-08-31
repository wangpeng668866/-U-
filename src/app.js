import { assets, defaultSettings, historyItems, projects, topicIdeas } from "./mockData.js";
import { filterAssets, generateScriptPreview, getProjectProgress, getStatusLabel } from "./domain.js";

const state = {
  page: "workspace",
  selectedProjectId: projects[0].id,
  assetCategory: "全部",
  assetType: "全部",
  assetQuery: "",
  settings: { ...defaultSettings },
  selectedTopic: topicIdeas[0]
};

const app = document.querySelector("#app");

function render() {
  const selectedProject = projects.find((project) => project.id === state.selectedProjectId) || projects[0];
  app.innerHTML = `
    <div class="shell">
      ${renderSidebar()}
      <main class="main">
        ${renderTopbar(selectedProject)}
        <section class="content">
          ${renderPage(selectedProject)}
        </section>
      </main>
    </div>
  `;
  bindEvents();
}

function renderSidebar() {
  const nav = [
    { id: "workspace", label: "工作台", icon: "grid" },
    { id: "assets", label: "素材库", icon: "music" },
    { id: "history", label: "历史记录", icon: "clock" },
    { id: "settings", label: "设置", icon: "sliders" }
  ];

  return `
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark" aria-hidden="true"></div>
        <div>
          <strong>鹏程短视频智能体</strong>
          <span>PENGCHENG VIDEO STUDIO</span>
        </div>
      </div>
      <nav class="nav">
        ${nav
          .map(
            (item) => `
              <button class="nav-item ${state.page === item.id ? "active" : ""}" data-page="${item.id}">
                <span class="nav-icon ${item.icon}" aria-hidden="true"></span>
                <span>${item.label}</span>
              </button>
            `
          )
          .join("")}
      </nav>
      <div class="sidebar-footer">
        <button class="ghost-button" type="button">浅色界面</button>
        <button class="ghost-button" type="button">新手引导</button>
        <p>选题 · 文案 · 录制 · 字幕 · 成片 · 发布</p>
        <small>版本 v0.1.0</small>
      </div>
    </aside>
  `;
}

function renderTopbar(project) {
  return `
    <header class="topbar">
      <div class="project-picker">
        <span>项目</span>
        <select id="projectSelect" aria-label="选择项目">
          ${projects.map((item) => `<option value="${item.id}" ${item.id === project.id ? "selected" : ""}>${item.name}</option>`).join("")}
        </select>
        <button class="icon-button" id="newProject" type="button" title="新建项目">+</button>
      </div>
      <div class="mode-group" aria-label="模式切换">
        <button class="pill active" type="button">极速</button>
        <button class="pill" type="button">质量</button>
        <button class="pill active" type="button">精简</button>
        <button class="pill" type="button">专业</button>
      </div>
    </header>
  `;
}

function renderPage(project) {
  if (state.page === "assets") return renderAssets();
  if (state.page === "history") return renderHistory();
  if (state.page === "settings") return renderSettings();
  return renderWorkspace(project);
}

function renderWorkspace(project) {
  const script = generateScriptPreview(state.selectedTopic);
  return `
    <div class="workspace-grid">
      <section class="hero-panel">
        <div>
          <p class="eyebrow">当前项目 · ${getStatusLabel(project.status)}</p>
          <h1>这条视频，打算怎么做？</h1>
          <p class="muted">两种做法，点一下就开工。</p>
        </div>
        <div class="entry-grid">
          <button class="entry-card" type="button" data-action="startFullFlow">
            <span class="entry-icon bulb" aria-hidden="true"></span>
            <strong>选题 · 文案 · 剪辑 · 发布</strong>
            <span>从挖题写稿，一路做到成片发出去</span>
          </button>
          <button class="entry-card" type="button" data-action="startEdit">
            <span class="entry-icon camera" aria-hidden="true"></span>
            <strong>智能视频剪辑</strong>
            <span>跳过选题写稿，直接挑一种剪法出片</span>
          </button>
        </div>
      </section>

      <section class="panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">全流程进度</p>
            <h2>${project.name}</h2>
          </div>
          <span class="status-badge">${project.currentStep}</span>
        </div>
        <div class="steps">
          ${getProjectProgress(project.currentStep)
            .map((step) => `<span class="step ${step.state}">${step.label}</span>`)
            .join("")}
        </div>
      </section>

      <section class="panel topic-panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">选题池</p>
            <h2>今日可拍方向</h2>
          </div>
          <button class="secondary-button" id="refreshTopics" type="button">换一批</button>
        </div>
        <div class="topic-list">
          ${topicIdeas
            .map(
              (topic) => `
                <button class="topic-row ${topic.title === state.selectedTopic.title ? "selected" : ""}" data-topic="${topic.title}" type="button">
                  <span>
                    <strong>${topic.title}</strong>
                    <small>${topic.angle}</small>
                  </span>
                  <b>${topic.score}</b>
                </button>
              `
            )
            .join("")}
        </div>
      </section>

      <section class="panel script-panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">文案预览</p>
            <h2>${script.title}</h2>
          </div>
          <button class="primary-button" type="button">生成分镜</button>
        </div>
        <div class="script-preview">
          <p><strong>开头：</strong>${script.hook}</p>
          <p><strong>正文：</strong>${script.body}</p>
          <p><strong>结尾：</strong>${script.ending}</p>
        </div>
      </section>
    </div>
  `;
}

function renderAssets() {
  const categories = ["全部", ...new Set(assets.map((asset) => asset.category))];
  const types = ["全部", "image", "video", "audio"];
  const visibleAssets = filterAssets(assets, {
    category: state.assetCategory,
    type: state.assetType,
    query: state.assetQuery
  });

  return `
    <section class="page-heading">
      <h1>素材库</h1>
      <p>画面、音效、字体、字幕样式的素材池，一库越丰富，成片越有料。</p>
    </section>
    <section class="panel">
      <div class="filter-row">
        ${categories.map((category) => `<button class="chip ${state.assetCategory === category ? "active" : ""}" data-category="${category}" type="button">${category}</button>`).join("")}
      </div>
      <div class="toolbar">
        <div class="segmented">
          ${types.map((type) => `<button class="${state.assetType === type ? "active" : ""}" data-type="${type}" type="button">${type === "全部" ? "全部" : type}</button>`).join("")}
        </div>
        <input id="assetSearch" type="search" value="${state.assetQuery}" placeholder="搜索素材、分类或标签" />
        <button class="primary-button" type="button">导入画面素材</button>
      </div>
      <div class="asset-list">
        ${visibleAssets.map(renderAssetRow).join("") || `<p class="empty">没有匹配的素材。</p>`}
      </div>
    </section>
  `;
}

function renderAssetRow(asset) {
  const initials = asset.name.slice(0, 2);
  return `
    <article class="asset-row">
      <div class="thumb">${initials}</div>
      <div>
        <h3>${asset.name}</h3>
        <p>${asset.tags.join(" · ")}</p>
      </div>
      <span class="asset-meta">${asset.source === "built_in" ? "内置" : "导入"}</span>
      <span class="asset-meta">${asset.type}</span>
      <button class="secondary-button" type="button">应用</button>
    </article>
  `;
}

function renderHistory() {
  return `
    <section class="page-heading">
      <h1>历史记录</h1>
      <p>每次生成、剪辑、封面和发布动作都会留痕，方便重跑和回滚。</p>
    </section>
    <section class="panel history-list">
      ${historyItems
        .map(
          (item) => `
            <article class="history-row">
              <div>
                <strong>${item.type}</strong>
                <span>${item.projectName}</span>
              </div>
              <span class="status-badge ${item.status}">${getStatusLabel(item.status)}</span>
              <span>${item.output}</span>
              <time>${item.time}</time>
              <button class="secondary-button" type="button">重新执行</button>
            </article>
          `
        )
        .join("")}
    </section>
  `;
}

function renderSettings() {
  return `
    <section class="page-heading">
      <h1>设置</h1>
      <p>配置 AI 接口、封面出图、数字人口播、发布账号和本地数据目录。</p>
    </section>
    <section class="settings-grid">
      ${renderSettingsCard("AI 接口", [
        ["服务商", state.settings.aiProvider],
        ["模型", "deepseek-v4-flash"],
        ["API Key", "••••••••••••••••"]
      ])}
      ${renderSettingsCard("封面等图片生成", [
        ["出图服务", state.settings.imageProvider],
        ["看图模型", "GLM"],
        ["风格", "短视频爆款封面"]
      ])}
      ${renderSettingsCard("数字人", [
        ["声音克隆", state.settings.voiceProvider],
        ["对口型", state.settings.avatarProvider],
        ["照片驱动", "灵动人像"]
      ])}
      ${renderSettingsCard("发布账号绑定", [
        ["抖音", "未绑定"],
        ["小红书", "未绑定"],
        ["B 站", "未绑定"]
      ])}
      <section class="panel wide">
        <div class="panel-header">
          <div>
            <p class="eyebrow">本地数据</p>
            <h2>数据目录</h2>
          </div>
          <button class="primary-button" type="button">保存</button>
        </div>
        <input class="full-input" value="${state.settings.dataDir}" aria-label="数据目录" />
      </section>
    </section>
  `;
}

function renderSettingsCard(title, rows) {
  return `
    <section class="panel">
      <div class="panel-header">
        <h2>${title}</h2>
        <button class="secondary-button" type="button">测试连接</button>
      </div>
      <div class="settings-list">
        ${rows.map(([label, value]) => `<label><span>${label}</span><input value="${value}" /></label>`).join("")}
      </div>
    </section>
  `;
}

function bindEvents() {
  document.querySelectorAll("[data-page]").forEach((button) => {
    button.addEventListener("click", () => {
      state.page = button.dataset.page;
      render();
    });
  });

  const projectSelect = document.querySelector("#projectSelect");
  if (projectSelect) {
    projectSelect.addEventListener("change", (event) => {
      state.selectedProjectId = event.target.value;
      render();
    });
  }

  document.querySelectorAll("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
      state.assetCategory = button.dataset.category;
      render();
    });
  });

  document.querySelectorAll("[data-type]").forEach((button) => {
    button.addEventListener("click", () => {
      state.assetType = button.dataset.type;
      render();
    });
  });

  const assetSearch = document.querySelector("#assetSearch");
  if (assetSearch) {
    assetSearch.addEventListener("input", (event) => {
      state.assetQuery = event.target.value;
      render();
      const nextInput = document.querySelector("#assetSearch");
      nextInput?.focus();
      nextInput?.setSelectionRange(state.assetQuery.length, state.assetQuery.length);
    });
  }

  document.querySelectorAll("[data-topic]").forEach((button) => {
    button.addEventListener("click", () => {
      const topic = topicIdeas.find((item) => item.title === button.dataset.topic);
      if (topic) state.selectedTopic = topic;
      render();
    });
  });
}

render();
