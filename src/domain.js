export function filterAssets(assets, filters = {}) {
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

export function getProjectProgress(step) {
  const steps = ["选题", "文案", "口播/素材", "剪辑", "封面", "发布"];
  const currentIndex = Math.max(0, steps.indexOf(step));
  return steps.map((label, index) => ({
    label,
    state: index < currentIndex ? "done" : index === currentIndex ? "active" : "idle"
  }));
}

export function createProject(name, mode = "original") {
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
    updatedAt: "刚刚"
  };
}

export function getStatusLabel(status) {
  const labels = {
    draft: "草稿",
    processing: "处理中",
    ready: "已就绪",
    published: "已发布",
    failed: "失败"
  };
  return labels[status] || "未知";
}

export function generateScriptPreview(topic) {
  return {
    title: topic.title,
    hook: `你有没有发现，${topic.title.replace("如何", "真正要解决的是")}。`,
    body: `第一步先抓住用户最关心的问题，第二步给出可执行动作，第三步用一个具体场景收尾。`,
    ending: "想把这类视频批量做出来，可以把选题、文案、素材和发布全部串成固定流程。"
  };
}

export function generateMockTopics(seed = "短视频") {
  const keyword = seed.trim() || "短视频";
  return [
    {
      id: `topic-${keyword}-1`,
      title: `${keyword}账号如何用 30 秒讲清一个卖点`,
      score: 94,
      angle: "痛点开场 + 场景证明 + 行动引导"
    },
    {
      id: `topic-${keyword}-2`,
      title: `${keyword}爆款视频的前三秒到底怎么设计`,
      score: 91,
      angle: "拆开头钩子、字幕节奏和反转点"
    },
    {
      id: `topic-${keyword}-3`,
      title: `${keyword}批量出片怎样减少沟通和返工`,
      score: 87,
      angle: "把选题、素材、剪辑和发布做成固定流程"
    }
  ];
}

export function createMockScript(topic) {
  const preview = generateScriptPreview(topic);
  return {
    id: `script-${Date.now()}`,
    topicTitle: topic.title,
    titleOptions: [
      topic.title,
      `${topic.title}，这套方法更适合批量做`,
      `别再凭感觉拍了：${topic.title}`
    ],
    ...preview,
    storyboard: [
      { shot: "开场", visual: "特写痛点画面，字幕压重点词", narration: preview.hook },
      { shot: "展开", visual: "素材库画面快切，配合三段式说明", narration: preview.body },
      { shot: "收尾", visual: "成片预览和发布平台图标", narration: preview.ending }
    ]
  };
}

export function createMockEditTask(project, assets = []) {
  const selectedAssets = assets.slice(0, 3).map((asset) => asset.name);
  return {
    id: `edit-${Date.now()}`,
    projectId: project.id,
    status: "ready",
    templateName: "三段式口播快剪",
    aspectRatio: "9:16",
    outputPath: `outputs/${project.name}-mock.mp4`,
    summary: selectedAssets.length > 0 ? `已匹配 ${selectedAssets.join("、")}` : "使用默认画面素材生成模拟成片"
  };
}

export function createMockPublishPackage(project, script, editTask) {
  return {
    id: `publish-${Date.now()}`,
    projectId: project.id,
    title: script?.titleOptions?.[0] || `${project.name} 发布标题`,
    caption: "把选题、文案、素材、剪辑和发布串成标准化流程，适合个人创作者和工作室批量出片。",
    coverText: "30 秒讲清卖点",
    videoPath: editTask?.outputPath || `outputs/${project.name}-mock.mp4`,
    platforms: ["抖音", "小红书", "视频号", "B 站"],
    status: "ready"
  };
}
