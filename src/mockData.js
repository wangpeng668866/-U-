export const projects = [
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

export const assets = [
  { id: "a1", name: "航拍城市绿道", type: "image", category: "城市", tags: ["绿道", "发展"], source: "built_in" },
  { id: "a2", name: "山间日落云海", type: "image", category: "自然", tags: ["情绪", "收尾"], source: "built_in" },
  { id: "a3", name: "中式菜品摆盘", type: "image", category: "餐饮美食", tags: ["探店", "菜品"], source: "built_in" },
  { id: "a4", name: "咖啡师出品", type: "video", category: "餐饮美食", tags: ["手艺", "出品"], source: "built_in" },
  { id: "a5", name: "蓝色光纤流动", type: "image", category: "科技", tags: ["数据", "算法"], source: "built_in" },
  { id: "a6", name: "街边露天咖啡座", type: "image", category: "城市", tags: ["氛围", "小店"], source: "built_in" },
  { id: "a7", name: "老字号小店窗口", type: "image", category: "街头人流", tags: ["烟火气", "招牌"], source: "built_in" },
  { id: "a8", name: "夜晚餐厅门头", type: "image", category: "餐饮美食", tags: ["开场", "门头"], source: "built_in" }
];

export const historyItems = [
  { id: "h1", type: "文案生成", projectName: "未命名项目 2026/8/31", status: "ready", time: "13:06", output: "3 条标题 + 1 版口播稿" },
  { id: "h2", type: "智能剪辑", projectName: "餐饮探店批量口播", status: "processing", time: "12:42", output: "字幕识别中" },
  { id: "h3", type: "封面方案", projectName: "本地生活账号", status: "failed", time: "11:18", output: "缺少图片接口配置" }
];

export const topicIdeas = [
  { title: "本地小店如何用 30 秒视频讲清优势", score: 92, angle: "先抛痛点，再给镜头清单" },
  { title: "探店视频为什么开头 3 秒决定完播", score: 88, angle: "拆爆款开头结构" },
  { title: "工作室批量剪辑如何减少返工", score: 84, angle: "用流程管理替代临时沟通" }
];

export const defaultSettings = {
  aiProvider: "DeepSeek",
  imageProvider: "智谱 CogView",
  voiceProvider: "MiniMax",
  avatarProvider: "阿里云百炼",
  dataDir: "C:\\Users\\11848\\AppData\\Roaming\\鹏程短视频智能体\\data",
  defaultMode: "极速",
  uiMode: "精简",
  theme: "dark"
};
