# First Step AI — Mini Spec

## 目标

帮助用户克服 "信息过载导致的拖延症"。用户输入任何任务/目标，AI 只告诉你**现在该做的下一步**，不给一大堆计划。

**核心价值主张：** Just one thing. No overwhelm.

## 核心功能

### 1. 任务输入
- 用户输入任意任务/目标（文本框）
- 示例：
  - "我想学编程"
  - "我想创业做 SaaS"
  - "我想减肥"
  - "我想学吉他"

### 2. Next Step 生成
- AI 分析任务，返回**一个具体、可执行的下一步**
- 下一步必须：
  - 具体（不是 "制定计划"，而是 "打开 freeCodeCamp.org"）
  - 可立即执行（现在就能做）
  - 有预估时间（约 30 分钟）
  - 有明确的完成标准

### 3. 进度追踪（可选）
- 用户完成后点 "Done"，获取下一步
- 保存历史记录（localStorage）

## 技术方案

- **前端：** React + Vite (TypeScript) + TailwindCSS
- **后端：** Python FastAPI
- **AI 调用：** 通过 llm-proxy.densematrix.ai
- **部署：** Docker → langsheng (39.109.116.180)
- **端口：** Frontend 30030, Backend 30031

## API 设计

### POST /api/next-step
```json
// Request
{
  "task": "我想学编程",
  "context": "之前没有任何编程经验",  // optional
  "history": []  // 之前完成的步骤，用于生成连续的下一步
}

// Response
{
  "step": {
    "action": "打开 freeCodeCamp.org，完成第一个 HTML 基础教程",
    "duration": "30 分钟",
    "completion_criteria": "完成教程中的所有练习，看到 '恭喜完成' 页面",
    "tip": "不用担心记不住，先跟着做一遍，后面会反复练习"
  },
  "tokens_used": 1
}
```

## 完成标准

- [x] 核心功能可用（输入任务 → 获取下一步）
- [ ] 部署到 https://first-step.demo.densematrix.ai
- [ ] Health check 通过
- [ ] 支付集成（Creem）
- [ ] 7 语言 i18n
- [ ] SEO 优化 + Programmatic SEO
- [ ] Prometheus Metrics
- [ ] 前端设计质量通过（非 AI slop）

## UI/UX 设计方向

**美学方向：** Calm, focused, minimal（帮助用户专注）

- 背景：柔和的渐变或纯色，避免分散注意力
- 字体：清晰易读的 sans-serif（如 Plus Jakarta Sans）
- 色调：蓝绿色系（calm）或暖色系（encouraging）
- 核心交互：大输入框 + 醒目的"下一步"卡片
- 动画：subtle，不花哨
