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
