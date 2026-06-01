# 🦀🐋 Clawd — Desktop Pet

一只会走、会唱、会睡、会切换形态的**像素桌面宠物**。基于 Tauri v2 + Canvas 渲染，透明置顶无边框窗口，在桌面上自由漫游。

## 两只宠物，一键切换

| | Clawd 🦀 | DeepSeek 🐋 |
|---|---|---|
| 原型 | Claude Code 官方螃蟹 | DeepSeek 蓝色鲸鱼 |
| 尺寸 | 95×70 px | 68×44 px |
| 来源 | `output.svg` 像素提取 | `dp.svg` 像素提取 |
| 词条 | 螃蟹/Claude/横着走 | 鲸鱼/数据深海/噗噗喷水 |
| 气泡色 | 橙色 `#D97757` | 蓝色 `#4A7DFF` |
| 特技 | 哼歌摆动 | 头顶喷水动画 |

**右键菜单 → 🔄 切换** 即可换宠，选择会自动记住。

## 快速开始

```bash
cd clawd
npm install
npx vite build && cd src-tauri && cargo build && start target/debug/clawd.exe
```

> 需要 [Node.js](https://nodejs.org) 和 [Rust](https://rustup.rs)。

## 交互

| 操作 | 响应 |
|------|------|
| **单击** | 抚摸 → 红心 ♥ |
| **双击** | 弹跳 + `> <` 笑眼 |
| **拖拽** | 抓起宠物放到新位置 |
| **右键** | 菜单：喂食 / 切换宠物 / 状态 |

## 状态 & 自动行为

- 🍞 **饥饿** — +1/10min，饿了会生气
- ⚡ **体力** — −1/5min，累了会眯眯眼
- 😊 **心情** — −1/15min，低时表情呆滞
- ❤️ **好感** — 不衰减，累积解锁

每 2 分钟随机触发：**哼歌**（8%）、**睡觉**（体力<30）、**稀有表情**（星星/震惊/晕眩/X眼，各 1%）。每 3~8 秒自动眨眼。

## 表情

| 表情 | Clawd | DeepSeek |
|------|-------|----------|
| 常态 | 3×4 黑方块 | 黑色瞳孔 |
| 开心 | `>` `<` 笑弧 | 眼区 `> <` |
| 爱心 | 红心覆盖眼区 | 红心 + V 尖 |
| 愤怒 | \\ // 怒眉 | 倒 V 怒眉 |
| 眯眯眼 | 上下抹黑留中 | 眼皮半盖 |
| 音符 | 音符形状 | 眼区音符 |
| 星星 | 金色 + 四角放射 | 金块 + 尖角 |
| 震惊 | 白瞳仁 | 放大黑眼 + 白瞳 |

## 天气

通过 ipapi.co 获取城市 → Open-Meteo 免费天气 API，无需 API Key。缓存 30 分钟，支持温度/天气码/湿度/风速，自动匹配对应台词。

## 项目结构

```
clawd/
├── src/
│   ├── main.ts              # 全部逻辑：渲染、表情、移动、养成、天气、交互
│   ├── data/
│   │   ├── crab-pixels.json  # 🦀 95×70 RGBA 像素数组
│   │   ├── whale-pixels.json # 🐋 68×44 RGBA 像素数组
│   │   ├── output.svg        # 螃蟹原始 SVG
│   │   └── dialogs.json      # 台词库
│   ├── actors/Clawd.ts       # 模块化宠类（规划中）
│   ├── core/                 # 状态机 / 行为树 / 精灵引擎
│   ├── systems/              # 养成 / 移动 / 对话 / 交互 / 右键菜单
│   ├── ui/SettingsPanel.ts   # 设置面板
│   └── utils/                # 事件总线 / 调色板
├── src-tauri/
│   ├── src/main.rs           # 透明置顶窗口
│   ├── src/commands.rs       # get_screen_info / move_window_to
│   └── tauri.conf.json       # 窗口配置
├── tools/                    # 构建/补丁脚本
└── index.html                # 入口
```

## 技术栈

- **框架** — [Tauri v2](https://v2.tauri.app)（Rust 后端 + Web 前端）
- **渲染** — `requestAnimationFrame` + `CanvasRenderingContext2D`
- **IPC** — `@tauri-apps/api` 动态导入（桌面/浏览器兼容）
- **语言** — TypeScript（前端）+ Rust（后端）
- **持久化** — localStorage

## 许可证

MIT
