# 鹏程短视频智能体复刻设计文档（下）

版本：V0.1
状态：待审批
日期：2026-08-31

## 9. 数据模型

本阶段建议先使用本地数据模型支撑完整流程，后续再替换为真实后端、云存储或第三方平台接口。

### 9.1 Project 项目

项目是所有工作流产物的归属单位。

字段建议：

- id：项目唯一标识
- name：项目名称
- mode：项目模式，original 或 edit
- createdAt：创建时间
- updatedAt：更新时间
- status：draft、processing、ready、published
- currentStep：当前流程节点
- topicId：关联选题
- scriptId：关联文案
- editId：关联剪辑任务
- publishId：关联发布任务

### 9.2 Topic 选题

字段建议：

- id：选题唯一标识
- projectId：所属项目
- title：选题标题
- keywords：关键词
- sourceType：manual、web_search、hot_video_reference
- targetAudience：目标人群
- angle：内容切入角度
- score：推荐评分
- reason：推荐理由
- createdAt：创建时间

### 9.3 Script 文案

字段建议：

- id：文案唯一标识
- projectId：所属项目
- topicId：关联选题
- titleOptions：标题备选
- hook：开头钩子
- body：正文
- ending：结尾引导
- durationSec：预估时长
- tone：语气风格
- storyboard：分镜列表
- createdAt：创建时间

### 9.4 Asset 素材

字段建议：

- id：素材唯一标识
- name：素材名称
- type：image、video、audio、font、subtitle_style、knowledge
- category：业务分类
- tags：标签
- source：built_in、imported、generated
- filePath：本地文件路径
- thumbnailPath：缩略图路径
- durationSec：音视频时长
- createdAt：创建时间

### 9.5 EditTask 剪辑任务

字段建议：

- id：剪辑任务唯一标识
- projectId：所属项目
- inputAssets：输入素材列表
- templateId：模板标识
- mode：auto、template、manual
- subtitleEnabled：是否生成字幕
- bgmAssetId：背景音乐
- aspectRatio：9:16、16:9、1:1
- status：pending、processing、ready、failed
- outputPath：导出视频路径
- logs：处理日志

### 9.6 PublishTask 发布任务

字段建议：

- id：发布任务唯一标识
- projectId：所属项目
- videoPath：视频路径
- coverPath：封面路径
- title：发布标题
- caption：发布文案
- platforms：目标平台
- scheduledAt：定时发布时间
- status：draft、ready、publishing、published、failed
- platformResults：各平台发布结果

### 9.7 Settings 设置

字段建议：

- aiProvider：文案模型服务商
- aiApiKey：文案模型密钥
- imageProvider：图片生成服务商
- imageApiKey：图片服务密钥
- voiceProvider：声音克隆服务商
- voiceApiKey：声音服务密钥
- avatarProvider：数字人服务商
- avatarApiKey：数字人服务密钥
- dataDir：本地数据目录
- defaultMode：极速、质量
- uiMode：精简、专业
- theme：dark、light

## 10. 页面字段设计

### 10.1 工作台

主字段：

- 当前项目名称
- 当前项目状态
- 两个主入口：全流程、智能视频剪辑
- 最近项目列表
- 最近生成记录
- 待完成任务

关键动作：

- 新建项目
- 继续上次项目
- 从选题开始
- 从素材剪辑开始

### 10.2 全流程页面

建议采用步骤条：

1. 选题
2. 文案
3. 口播/素材
4. 剪辑
5. 封面
6. 发布

每一步都需要有：

- 当前输入
- AI 建议
- 用户可编辑区域
- 保存草稿
- 进入下一步

### 10.3 智能剪辑页面

主字段：

- 素材导入区
- 剪辑模式
- 视频比例
- 字幕设置
- BGM 设置
- 模板选择
- 导出设置

关键动作：

- 导入视频
- 选择模板
- 开始智能剪辑
- 预览
- 导出

### 10.4 素材库

主字段：

- 素材类型 Tab
- 分类筛选
- 搜索框
- 素材列表
- 素材详情抽屉

关键动作：

- 导入素材
- 删除素材
- 收藏素材
- 应用到当前项目

### 10.5 历史记录

主字段：

- 任务类型
- 所属项目
- 生成时间
- 状态
- 输出文件
- 使用配置

关键动作：

- 查看详情
- 重新执行
- 复制为新项目
- 删除记录

### 10.6 设置

主字段：

- AI 接口配置
- 图片生成配置
- 数字人口播配置
- 发布账号绑定
- 数据目录
- 默认工作模式

关键动作：

- 测试连接
- 保存配置
- 重置配置
- 打开数据目录

## 11. 接口草案

第一阶段可以先实现本地 mock 服务或前端内置 service，保持接口形态稳定。

### 11.1 项目接口

- createProject(payload)
- listProjects()
- getProject(id)
- updateProject(id, patch)
- deleteProject(id)

### 11.2 选题与文案接口

- generateTopics(payload)
- generateScript(payload)
- rewriteScript(payload)
- generateStoryboard(payload)
- saveScript(payload)

### 11.3 素材接口

- importAsset(file)
- listAssets(filters)
- updateAsset(id, patch)
- deleteAsset(id)
- attachAssetToProject(projectId, assetId)

### 11.4 剪辑接口

- createEditTask(payload)
- previewEditTask(id)
- runEditTask(id)
- exportVideo(id)
- getEditTaskStatus(id)

### 11.5 封面与发布接口

- generateCover(payload)
- generatePublishCopy(payload)
- bindPlatformAccount(payload)
- createPublishTask(payload)
- runPublishTask(id)

### 11.6 设置接口

- getSettings()
- updateSettings(patch)
- testProviderConnection(providerType)
- validateDataDir(path)

## 12. 异常流设计

### 12.1 API Key 缺失

触发场景：

- 用户点击生成、测试连接、数字人或发布能力时，对应服务未配置密钥。

处理方式：

- 显示明确错误
- 提供跳转设置按钮
- 保留用户当前输入

### 12.2 生成失败

触发场景：

- 模型接口超时
- 返回内容为空
- 第三方服务限流

处理方式：

- 保留任务记录
- 提供重试
- 展示简短错误原因
- 允许用户改用 mock 或本地模板继续流程

### 12.3 素材不可用

触发场景：

- 文件被删除
- 格式不支持
- 视频损坏

处理方式：

- 标记素材失效
- 提供重新定位文件
- 不阻塞其他素材继续使用

### 12.4 发布失败

触发场景：

- 平台账号失效
- 文件超过平台限制
- 标题或文案不符合平台规则

处理方式：

- 按平台展示失败原因
- 已成功的平台保持成功状态
- 失败的平台可单独重试

## 13. 权限与安全

### 13.1 密钥存储

第一阶段避免把 API Key 写进代码仓库。推荐策略：

- 本地配置文件不提交
- 提供 `.env.example`
- 前端仅展示掩码
- 日志中不打印完整密钥

### 13.2 文件访问

- 用户导入素材时记录文件路径和缩略图
- 删除项目时默认不删除源文件
- 删除生成产物前需要二次确认

### 13.3 发布账号

- 第一阶段以账号绑定状态模拟为主
- 后续接入真实平台时再补 OAuth 或平台授权流程

## 14. 验收标准

### 14.1 产品验收

- 可以新建项目并切换项目
- 工作台首屏能看到两个主入口
- 可以完成一次选题到发布包的模拟流程
- 素材库可以筛选、导入、查看素材
- 历史记录能记录生成过程
- 设置页可以保存和读取配置

### 14.2 视觉验收

- 整体接近参考图的深色专业工具风格
- 左侧导航、顶部项目栏、主体卡片层级清晰
- 按钮、标签、输入框、状态提示风格统一
- 桌面宽屏下无明显空白失衡
- 移动或窄屏下内容不重叠、不溢出

### 14.3 工程验收

- 项目可本地启动
- 构建通过
- 核心状态和数据结构有测试覆盖
- 关键用户流程有端到端或集成验证
- 每次变更有对应 commit

## 15. 测试方案

### 15.1 单元测试

覆盖范围：

- 数据模型默认值
- 设置读写
- 项目状态流转
- 文案和分镜数据转换
- 素材筛选逻辑

### 15.2 集成测试

覆盖范围：

- 新建项目 -> 生成选题 -> 生成文案
- 导入素材 -> 创建剪辑任务 -> 生成模拟成片
- 生成封面 -> 生成发布文案 -> 创建发布任务
- 设置 API Key -> 测试连接 -> 保存配置

### 15.3 UI 验证

覆盖范围：

- 工作台首屏
- 素材库筛选
- 设置页表单
- 历史记录状态
- 宽屏和窄屏截图

### 15.4 手动验收清单

- 全流程入口可以走通
- 智能剪辑入口可以走通
- 切换精简/专业模式后页面信息量变化合理
- 切换极速/质量模式后配置状态正确
- 断网或 API 缺失时有可理解的提示

## 16. 开发阶段拆分建议

### 16.1 阶段一：静态可交互原型

- 搭建项目
- 实现布局和页面导航
- 使用 mock 数据完成核心页面
- 完成基础视觉复刻

### 16.2 阶段二：本地数据闭环

- 实现项目、素材、设置、历史记录的本地存储
- 实现模拟生成流程
- 增加基础测试

### 16.3 阶段三：AI 能力接入

- 接入文案生成
- 接入封面生成
- 接入口播和剪辑任务的服务抽象
- 增加失败重试和日志

### 16.4 阶段四：发布包与平台扩展

- 生成平台发布包
- 实现账号绑定占位流程
- 为真实平台发布预留接口
- 增加发布失败处理

## 17. 审批后开发入口

审批通过后，建议从阶段一开始开发，优先交付一个可运行、可点、风格接近参考图的本地应用。第一版实现不依赖真实第三方 API，但所有入口、状态和数据结构都要按真实产品预留。

建议首个开发 commit 范围：

- 初始化前端项目
- 创建基础布局
- 实现工作台、素材库、历史记录、设置四个页面
- 添加 mock 数据和基础测试

---

> 以上为设计文档下半部分。审批通过后即可进入开发阶段。
