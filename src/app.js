const initialProjects = [
  {
    id: "project-001",
    name: "未命名项目 2026/8/31",
    mode: "original",
    status: "draft",
    currentStep: "选题",
    updatedAt: "13:18"
  },
  {
    id: "project-002",
    name: "餐饮探店批量口播",
    mode: "edit",
    status: "ready",
    currentStep: "剪辑",
    updatedAt: "昨天"
  }
];

const initialAssets = [
  { id: "a1", name: "航拍城市绿道", type: "image", category: "城市", tags: ["绿道", "发展"], source: "built_in" },
  { id: "a2", name: "山间日落云海", type: "image", category: "自然", tags: ["情绪", "收尾"], source: "built_in" },
  { id: "a3", name: "中式菜品摆盘", type: "image", category: "餐饮美食", tags: ["探店", "菜品"], source: "built_in" },
  { id: "a4", name: "咖啡师出品", type: "video", category: "餐饮美食", tags: ["手艺", "出品"], source: "built_in" },
  { id: "a5", name: "蓝色光纤流动", type: "image", category: "科技", tags: ["数据", "算法"], source: "built_in" },
  { id: "a6", name: "街边露天咖啡座", type: "image", category: "城市", tags: ["氛围", "小店"], source: "built_in" },
  { id: "a7", name: "老字号小店窗口", type: "image", category: "街头人流", tags: ["烟火气", "招牌"], source: "built_in" },
  { id: "a8", name: "夜晚餐厅门头", type: "image", category: "餐饮美食", tags: ["开场", "门头"], source: "built_in" }
];

const initialHistoryItems = [
  { id: "h1", type: "文案生成", projectName: "未命名项目 2026/8/31", status: "ready", time: "13:06", output: "3 条标题 + 1 版口播稿" },
  { id: "h2", type: "智能剪辑", projectName: "餐饮探店批量口播", status: "processing", time: "12:42", output: "字幕识别中" },
  { id: "h3", type: "封面方案", projectName: "本地生活账号", status: "failed", time: "11:18", output: "缺少图片接口配置" }
];

const topicIdeas = [
  { title: "本地小店如何用 30 秒视频讲清优势", score: 92, angle: "先抛痛点，再给镜头清单" },
  { title: "探店视频为什么开头 3 秒决定完播", score: 88, angle: "拆爆款开头结构" },
  { title: "工作室批量剪辑如何减少返工", score: 84, angle: "用流程管理替代临时沟通" }
];

const defaultSettings = {
  aiProvider: "DeepSeek",
  aiModel: "deepseek-v4-flash",
  aiApiKey: "",
  imageProvider: "智谱 CogView",
  visionModel: "GLM",
  coverStyle: "短视频爆款封面",
  voiceProvider: "MiniMax",
  avatarProvider: "阿里云百炼",
  photoDriver: "灵动人像",
  douyinAccount: "未绑定",
  xiaohongshuAccount: "未绑定",
  bilibiliAccount: "未绑定",
  dataDir: "C:\\Users\\11848\\AppData\\Roaming\\鹏程短视频智能体\\data",
  defaultMode: "极速",
  uiMode: "精简",
  theme: "dark"
};

const STORAGE_KEY = "pengcheng-video-agent-state-v1";

function getStorage() {
  try {
    const storage = window.localStorage;
    const testKey = `${STORAGE_KEY}-test`;
    storage.setItem(testKey, "1");
    storage.removeItem(testKey);
    return storage;
  } catch {
    return null;
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadStoredState(storage = getStorage()) {
  if (!storage) return {};

  try {
    const raw = storage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredState(snapshot, storage = getStorage()) {
  if (!storage) return false;

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    return true;
  } catch {
    return false;
  }
}

function restoreList(value, fallback) {
  return Array.isArray(value) && value.length > 0 ? value : clone(fallback);
}

const storedState = loadStoredState();
let projects = restoreList(storedState.projects, initialProjects);
let assets = restoreList(storedState.assets, initialAssets);
let historyItems = restoreList(storedState.historyItems, initialHistoryItems);

function filterAssets(assets, filters = {}) {
  const { category = "全部", type = "全部", query = "" } = filters;
  const normalizedQuery = query.trim().toLowerCase();

  return assets.filter((asset) => {
    const categoryMatches = category === "全部" || asset.category === category;
    const typeMatches = type === "全部" || asset.type === type;
    const text = [asset.name, asset.category, ...(asset.tags || [])].join(" ").toLowerCase();
    const queryMatches = normalizedQuery.length === 0 || text.includes(normalizedQuery);
    return categoryMatches && typeMatches && queryMatches;
  });
}

function getProjectProgress(step) {
  const steps = ["选题", "文案", "口播/素材", "剪辑", "封面", "发布"];
  const currentIndex = Math.max(0, steps.indexOf(step));
  return steps.map((label, index) => ({
    label,
    state: index < currentIndex ? "done" : index === currentIndex ? "active" : "idle"
  }));
}

function getStatusLabel(status) {
  const labels = {
    draft: "草稿",
    processing: "处理中",
    ready: "已就绪",
    published: "已发布",
    failed: "失败"
  };
  return labels[status] || "未知";
}

function generateScriptPreview(topic) {
  return {
    title: topic.title,
    hook: `你有没有发现，${topic.title.replace("如何", "真正要解决的是")}。`,
    body: "第一步先抓住用户最关心的问题，第二步给出可执行动作，第三步用一个具体场景收尾。",
    ending: "想把这类视频批量做出来，可以把选题、文案、素材和发布全部串成固定流程。"
  };
}

function createLocalProject(name, mode = "original") {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error("项目名称不能为空");
  }

  return {
    id: `project-${Date.now()}`,
    name: trimmedName,
    mode,
    status: "draft",
    currentStep: "选题",
    createdAt: new Date().toISOString(),
    updatedAt: "刚刚"
  };
}

function getCurrentProject() {
  return projects.find((project) => project.id === state.selectedProjectId) || projects[0];
}

function addHistory(type, output, status = "ready") {
  const project = getCurrentProject();
  historyItems = [
    {
      id: `h-${Date.now()}`,
      type,
      projectName: project?.name || "未命名项目",
      status,
      time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
      output
    },
    ...historyItems
  ].slice(0, 50);
}

function openProjectCreator() {
  state.isCreatingProject = true;
  state.newProjectName = `未命名项目 ${new Date().toLocaleDateString("zh-CN")}`;
  render();
}

function confirmProjectFromInput() {
  if (!state.isCreatingProject) return;

  const input = document.querySelector("#newProjectName");
  const name = input?.value || state.newProjectName;

  if (!name.trim()) {
    input?.focus();
    return;
  }

  const project = createLocalProject(name);
  projects = [project, ...projects];
  state.selectedProjectId = project.id;
  state.isCreatingProject = false;
  state.newProjectName = "";
  addHistory("项目创建", "已创建本地项目草稿");
  persistAppState();
  render();
}

function cancelProjectCreator() {
  state.isCreatingProject = false;
  state.newProjectName = "";
  render();
}

const state = {
  page: storedState.ui?.page || "workspace",
  selectedProjectId: projects.some((project) => project.id === storedState.ui?.selectedProjectId)
    ? storedState.ui.selectedProjectId
    : projects[0].id,
  assetCategory: storedState.ui?.assetCategory || "全部",
  assetType: storedState.ui?.assetType || "全部",
  assetQuery: "",
  isCreatingProject: false,
  newProjectName: "",
  settings: { ...defaultSettings, ...(storedState.settings || {}) },
  selectedTopic: topicIdeas[0]
};

const app = document.querySelector("#app");

function persistAppState() {
  saveStoredState({
    projects,
    assets,
    historyItems,
    settings: state.settings,
    ui: {
      page: state.page,
      selectedProjectId: state.selectedProjectId,
      assetCategory: state.assetCategory,
      assetType: state.assetType
    }
  });
}

function render() {
  app.classList.remove("boot-fallback");
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
        ${
          state.isCreatingProject
            ? `<form class="new-project-inline" id="newProjectForm">
                <input id="newProjectName" value="${state.newProjectName}" placeholder="输入项目名" aria-label="新项目名称" />
                <button class="primary-button" id="confirmNewProject" type="submit" onpointerdown="confirmProjectFromInput()" onmousedown="confirmProjectFromInput()">创建</button>
                <button class="secondary-button" id="cancelNewProject" type="button">取消</button>
              </form>`
            : `<button class="icon-button" id="newProject" type="button" title="新建项目" onclick="openProjectCreator()">+</button>`
        }
      </div>
      <div class="mode-group" aria-label="模式切换">
        <span class="sync-status">本地已保存</span>
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
          <button class="primary-button" id="generateStoryboard" type="button">生成分镜</button>
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
        <button class="primary-button" id="importAssetButton" type="button">导入画面素材</button>
        <input class="visually-hidden" id="assetFileInput" type="file" multiple aria-label="选择素材文件" />
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
      <button class="secondary-button" data-asset-id="${asset.id}" type="button">应用</button>
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
        ["服务商", state.settings.aiProvider, "aiProvider"],
        ["模型", state.settings.aiModel, "aiModel"],
        ["API Key", state.settings.aiApiKey, "aiApiKey", "password"]
      ])}
      ${renderSettingsCard("封面等图片生成", [
        ["出图服务", state.settings.imageProvider, "imageProvider"],
        ["看图模型", state.settings.visionModel, "visionModel"],
        ["风格", state.settings.coverStyle, "coverStyle"]
      ])}
      ${renderSettingsCard("数字人", [
        ["声音克隆", state.settings.voiceProvider, "voiceProvider"],
        ["对口型", state.settings.avatarProvider, "avatarProvider"],
        ["照片驱动", state.settings.photoDriver, "photoDriver"]
      ])}
      ${renderSettingsCard("发布账号绑定", [
        ["抖音", state.settings.douyinAccount, "douyinAccount"],
        ["小红书", state.settings.xiaohongshuAccount, "xiaohongshuAccount"],
        ["B 站", state.settings.bilibiliAccount, "bilibiliAccount"]
      ])}
      <section class="panel wide">
        <div class="panel-header">
          <div>
            <p class="eyebrow">本地数据</p>
            <h2>数据目录</h2>
          </div>
          <button class="primary-button" id="saveSettings" type="button">保存</button>
        </div>
        <input class="full-input" data-setting-key="dataDir" value="${state.settings.dataDir}" aria-label="数据目录" />
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
        ${rows
          .map(
            ([label, value, key, type = "text"]) =>
              `<label><span>${label}</span><input type="${type}" data-setting-key="${key}" value="${value}" /></label>`
          )
          .join("")}
      </div>
    </section>
  `;
}

function bindEvents() {
  document.querySelectorAll("[data-page]").forEach((button) => {
    button.addEventListener("click", () => {
      state.page = button.dataset.page;
      persistAppState();
      render();
    });
  });

  const projectSelect = document.querySelector("#projectSelect");
  if (projectSelect) {
    projectSelect.addEventListener("change", (event) => {
      state.selectedProjectId = event.target.value;
      persistAppState();
      render();
    });
  }

  const newProjectName = document.querySelector("#newProjectName");
  if (newProjectName) {
    newProjectName.addEventListener("input", (event) => {
      state.newProjectName = event.target.value;
    });
    newProjectName.focus();
    newProjectName.select();
  }

  const newProjectForm = document.querySelector("#newProjectForm");
  if (newProjectForm) {
    newProjectForm.addEventListener("submit", (event) => {
      event.preventDefault();
      confirmProjectFromInput();
    });
  }

  const cancelNewProject = document.querySelector("#cancelNewProject");
  if (cancelNewProject) {
    cancelNewProject.addEventListener("click", cancelProjectCreator);
  }

  document.querySelectorAll("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
      state.assetCategory = button.dataset.category;
      persistAppState();
      render();
    });
  });

  document.querySelectorAll("[data-type]").forEach((button) => {
    button.addEventListener("click", () => {
      state.assetType = button.dataset.type;
      persistAppState();
      render();
    });
  });

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const project = getCurrentProject();
      if (!project) return;

      if (button.dataset.action === "startEdit") {
        project.currentStep = "剪辑";
        project.status = "processing";
        addHistory("智能剪辑", "已进入智能剪辑流程", "processing");
      } else {
        project.currentStep = "文案";
        project.status = "processing";
        addHistory("全流程启动", "已从选题进入文案流程", "processing");
      }

      project.updatedAt = "刚刚";
      persistAppState();
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
      addHistory("选题选择", `已选择：${button.dataset.topic}`);
      persistAppState();
      render();
    });
  });

  const generateStoryboard = document.querySelector("#generateStoryboard");
  if (generateStoryboard) {
    generateStoryboard.addEventListener("click", () => {
      const project = getCurrentProject();
      if (project) {
        project.currentStep = "口播/素材";
        project.status = "processing";
        project.updatedAt = "刚刚";
      }
      addHistory("分镜生成", "已生成 3 段口播分镜草稿");
      persistAppState();
      render();
    });
  }

  const importAssetButton = document.querySelector("#importAssetButton");
  const assetFileInput = document.querySelector("#assetFileInput");
  if (importAssetButton && assetFileInput) {
    importAssetButton.addEventListener("click", () => assetFileInput.click());
    assetFileInput.addEventListener("change", (event) => {
      const files = [...event.target.files];
      if (files.length === 0) return;

      const importedAssets = files.map((file) => ({
        id: `asset-${Date.now()}-${file.name}`,
        name: file.name.replace(/\.[^.]+$/, ""),
        type: file.type.startsWith("video/") ? "video" : file.type.startsWith("audio/") ? "audio" : "image",
        category: "导入素材",
        tags: ["本地导入"],
        source: "imported",
        filePath: file.name,
        createdAt: new Date().toISOString()
      }));
      assets = [...importedAssets, ...assets];
      state.assetCategory = "导入素材";
      addHistory("素材导入", `已记录 ${files.length} 个本地素材`);
      persistAppState();
      render();
    });
  }

  document.querySelectorAll("[data-asset-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const asset = assets.find((item) => item.id === button.dataset.assetId);
      if (!asset) return;
      addHistory("素材应用", `已将「${asset.name}」应用到当前项目`);
      persistAppState();
      render();
    });
  });

  const saveSettings = document.querySelector("#saveSettings");
  if (saveSettings) {
    saveSettings.addEventListener("click", () => {
      document.querySelectorAll("[data-setting-key]").forEach((input) => {
        state.settings[input.dataset.settingKey] = input.value;
      });
      addHistory("设置保存", "AI 接口、发布账号和数据目录已保存到本地");
      persistAppState();
      render();
    });
  }
}

window.openProjectCreator = openProjectCreator;
window.confirmProjectFromInput = confirmProjectFromInput;
window.cancelProjectCreator = cancelProjectCreator;

render();
