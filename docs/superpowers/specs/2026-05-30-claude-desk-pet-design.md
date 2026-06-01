# 胖螃蟹 (Clawd) — Claude Code 桌面宠物设计文档

> **版本**: v1.0  
> **日期**: 2026-05-30  
> **状态**: 设计阶段

---

## 1. 项目概述

### 1.1 产品定义

一个基于 **Claude Code 官方螃蟹吉祥物 (Clawd)** 的跨平台桌面宠物应用。角色在桌面上自由行走、攀爬窗口边缘、在任务栏活动，具备中度养成系统，支持本地台词库对话和可选的 Claude API 智能聊天。

### 1.2 核心体验目标

- **陪伴感**: 角色在桌面上自然活动，像一个真正的小生物
- **治愈感**: 可爱的像素动画 + 丰富的表情动作 + 温暖的对话
- **养成感**: 4 维状态数值 + 好感度等级，解锁新动作和台词
- **低存在感**: 后台运行时资源占用极低，不打扰正常工作

### 1.3 目标平台

- Windows (主要)
- macOS
- Linux (X11)

---

## 2. 技术栈

| 层 | 技术 | 职责 |
|----|------|------|
| 打包框架 | **Tauri v2** | 窗口管理、系统集成、打包分发 |
| 前端渲染 | **PixiJS v8** | 2D 精灵动画引擎、Canvas 渲染 |
| 原生层 | **Rust** | 窗口检测、透明窗口、系统托盘、数据持久化 |
| 通信 | **Tauri Commands + Events** | 前端↔后端 IPC |
| 数据存储 | **SQLite** (Tauri 侧) | 养成数值、设置、好感度持久化 |
| 打包体积目标 | ~10-15MB | |
| 运行时内存目标 | <80MB | |

### 2.1 技术选型理由

- **Tauri > Electron**: 桌宠是常驻后台程序，Tauri 打包体积小 (~10MB vs ~150MB)、内存低 (~80MB vs ~200MB)，Rust 能直接调用 OS API 做窗口攀爬检测和透明度控制
- **PixiJS > DOM/CSS**: 精灵帧动画在 Canvas 上比 DOM 动画更流畅，PixiJS 有成熟的 Sprite Sheet 支持和 NEAREST 采样模式
- **SQLite > localStorage**: 养成数据需要可靠持久化，SQLite 结构化管理比 localStorage 更可靠

---

## 3. 角色设计

### 3.1 角色原型

基于用户提供的官方 SVG (`output.svg`) — Claude Code 官方像素螃蟹。

| 属性 | 值 |
|------|-----|
| 分辨率 | **95 × 70 px** |
| 风格 | 官方像素艺术（精细化 9 色明暗，非粗糙复古 8-bit） |
| 渲染模式 | `crispEdges` — 近邻采样，保持像素锐利 |
| 显示尺寸 | 2x (190×140) 到 4x (380×280)，根据屏幕缩放自适应 |

### 3.2 官方调色板（9 色）

| 序号 | 色值 | 用途 | 像素数 |
|------|------|------|--------|
| 1 | `#191A1B` | 背景/眼睛 | 5,371 |
| 2 | `#D97757` | 🦀 **主体色** (Anthropic 官方 Orange) | 1,059 |
| 3 | `#312623` | 暗部/最深阴影 | 61 |
| 4 | `#905440` | 阴影/暗面 | 41 |
| 5 | `#794839` | 阴影过渡 | 27 |
| 6 | `#C16B4F` | 亮部/高光面 | 26 |
| 7 | `#623D32` | 深阴影 | 24 |
| 8 | `#49312A` | 深阴影 | 24 |
| 9 | `#A86048` | 中间调 | 17 |

> **严格原则**: 所有动画帧、所有变体皮肤均使用此 9 色调色板，不在运行时引入新颜色。

### 3.3 动画帧制作策略

以官方 SVG 的 idle 帧为基准，所有其他动作通过以下方式制作：

1. **微调法** (idle 呼吸/眨眼): 在原图上做像素级修改
2. **拆件法** (walk/climb/sit): 将角色拆解为身体/钳子/腿/眼睛部件，通过部件位移 + 图层叠加生成多帧
3. **重绘法** (fall/sleep/special): 基于原调色板和身体比例手绘新帧

---

## 4. 动画系统

### 4.1 动画状态机

```
                      ┌──────────────┐
                      │   IDLE 待机   │ ← 默认状态，呼吸动画 + 眨眼
                      └──┬───┬───┬──┘
        ┌────────┬───────┘   │   └───────┬────────┐
        ▼        ▼           ▼           ▼        ▼
     WALK      CLIMB      SLEEP       EMOTE    INTERACT
    行走移动   攀爬窗口    睡觉休息     表情动作   交互响应
     ┊          ┊           ┊           ┊         ┊
     ▼          ▼           ▼           ┊         ▼
    FALL       SIT        WAKE          ┊       EAT/CHAT
    掉落       边缘坐下    醒来          ┊       进食/对话
                                        ┊
                              HAPPY/ANGRY/HEART
```

**状态转换优先级**（高→低）:
1. 用户直接交互 (拖拽/点击/右键)
2. 养成紧急需求 (饥饿/体力归零)
3. 环境触发 (窗口变化/鼠标靠近)
4. 随机探索行为
5. 默认 idle

**循环状态**: IDLE / WALK / CLIMB / SIT / SLEEP
**一次性状态**: FALL / WAKE / EAT / EMOTE / HAPPY / ANGRY / HEART（播完自动回到循环状态）

### 4.2 精灵表规格

| 动作 | 帧数 | 帧率 (fps) | 方向 | 备注 |
|------|------|-----------|------|------|
| idle | 6 | 8 | 2 (L/R) | 含呼吸幅度变化 + 眨眼帧 |
| walk | 8 | 10 | 2 (L/R) | 腿部件横向位移 + 身体弹跳 |
| climb | 6 | 8 | 2 (L/R) | 钳子抓取 + 身体上拉 |
| fall | 4 | 10 | 1 | 旋转翻滚 |
| sit | 4 | 6 | 2 (L/R) | 腿部折叠坐姿 + 晃动 |
| sleep | 4 | 6 | 1 | 闭眼 + 缓慢起伏 + Zzz 粒子 |
| eat | 6 | 10 | 1 | 钳子夹食物送嘴部 |
| happy | 6 | 10 | 1 | 弹跳 + 钳子挥舞 + 爱心粒子 |
| angry | 4 | 8 | 1 | 钳子砸地 + 身体抖动 |
| heart | 4 | 8 | 1 | 冒爱心 |
| wake | 4 | 8 | 1 | 伸懒腰 |
| special | 8 | 10 | 1 | 彩蛋舞蹈 |

---

## 5. 行为系统

### 5.1 三层决策架构

```
Layer 1: 需求评估层 (每 500ms)
  [饥饿] [体力] [心情] [好感度]
         ↓ 优先级排序
Layer 2: 行为仲裁层 (竞争式)
  需求行为 > 用户交互 > 环境触发 > 随机探索
         ↓ 唯一胜出行为
Layer 3: 行为执行层 (状态机 + 行为树)
  state → sequence/selector → AnimationController
       → 行为后效果 (状态变化/粒子/气泡)
```

### 5.2 日常行为节奏

| 阶段 | 触发条件 | 行为 |
|------|---------|------|
| 🌅 启动 | 应用刚启动 | WAKE 动画 → 随机走动 → 探索桌面 |
| ☀️ 活跃 | 常态 | 高概率行走探索、攀爬窗口、偶尔坐下发呆 |
| 😴 疲劳 | 体力 < 30 | 找角落坐下 → SLEEP 睡觉 → Zzz 气泡 |
| 🍞 饥饿 | 饥饿 > 80 | 焦急走动、冒食物气泡、主动引起注意 |
| 🎲 随机 | 概率触发 | 翻跟头、跳舞、追鼠标、稀有彩蛋 |

---

## 6. 养成系统

### 6.1 四大状态维度

| 维度 | 范围 | 衰减速度 | 影响 |
|------|------|---------|------|
| 🍞 饥饿 (Hunger) | 0-100 | -1/10min | 高值触发觅食，拒绝玩耍 |
| ⚡ 体力 (Energy) | 0-100 | -1/5min(活动时) | 耗尽强制睡眠，移动变慢 |
| 😊 心情 (Mood) | 0-100 | -1/15min | 影响表情/动作丰富度 |
| ❤️ 好感 (Affection) | 0-100 | **不衰减** | 累积解锁新内容 |

### 6.2 好感度等级 & 解锁

| 等级 | 好感范围 | 解锁内容 |
|------|---------|---------|
| 🦀 陌生 | 0-25 | 基本动作 (idle/walk/climb/sleep/eat) |
| 🦀 熟悉 | 26-50 | 坐窗口晃腿、偶尔招手、更多台词 |
| 🦀 亲近 | 51-75 | 跳舞、特殊表情、主动靠近鼠标光标 |
| 🦀 羁绊 | 76-100 | 彩蛋动作、稀有台词、金色闪光皮肤 |

### 6.3 好感度获取方式

| 行为 | 好感+ |
|------|-------|
| 抚摸 (点击) | +3 |
| 喂食 | +5 |
| 聊天互动 | +2 |
| 长时间在线陪伴 | +1/30min |
| 双击 (开心互动) | +1 |

---

## 7. 桌面交互系统

### 7.1 窗口方案

| 属性 | 值 |
|------|-----|
| 窗口类型 | 全屏透明、无边框、始终置顶 |
| 鼠标穿透 | 非角色区域穿透到下层窗口 |
| 焦点策略 | 不抢夺键盘焦点 |
| 任务栏 | 不在任务栏显示主窗口图标 |
| 缩放 | 跟随屏幕分辨率变化自动 resize |

**实现方式**: Tauri 创建全屏透明窗口 → 覆盖在整个桌面上 → PixiJS Canvas 渲染角色 → 仅角色像素区域响应鼠标 → 其他区域 `setIgnoreCursorEvents(true)` 鼠标穿透

### 7.2 鼠标交互

| 操作 | 响应 |
|------|------|
| 单击 | 打招呼，冒气泡随机台词 |
| 双击 | 开心跳起 + HEART 动画 + 爱心粒子 |
| 拖拽 | 抓起螃蟹放到新位置 |
| 右键 | 系统托盘菜单 (喂食/聊天/设置/退出) |
| 鼠标靠近 | 眼睛跟随鼠标方向移动 |
| 悬停 | 短暂显示当前状态摘要气泡 |

### 7.3 右键菜单结构

```
🍞 喂食 (Feed)
💬 聊天 (Chat) — 需要配置 API Key
🎒 背包 (Items)
⚙️ 设置 (Settings)
────────────
❌ 退出 (Quit)
```

### 7.4 移动 & 物理模型

- **行走速度**: ~60 px/s (2x 缩放后)
- **地面定义**: 任务栏顶部 / 屏幕底部 / 窗口顶部边缘
- **重力**: 无支撑面 → FALL 状态 → 射线检测第一个支撑面 → 着陆
- **移动模式**: 随机游走 (50~200px 距离) 或 目标导向 (走向窗口边缘)

---

## 8. 窗口攀爬系统

### 8.1 三级窗口感知

| 层级 | 名称 | 功能 |
|------|------|------|
| L1 | 窗口枚举 | OS API 获取所有顶层窗口，过滤排除自身、最小化、不可见窗口 |
| L2 | 边缘提取 | 从窗口矩形提取顶部/左右/底部边缘段，校验遮挡关系 |
| L3 | 攀爬决策 | 附近有边缘 → 行为仲裁 → A* 寻路到接触点 → CLIMB 动画 |

### 8.2 攀爬流程

```
检测窗口边缘在角色附近 (<20px)
    → 行为仲裁决定攀爬
    → 走到边缘接触点
    → CLIMB 动画 (钳子抓取 + 身体上拉)
    → 到达窗口顶部边缘
    → 沿顶部行走 / SIT 坐下 / 继续攀爬更高窗口
    → 窗口移动/关闭 → FALL → 落到下一表面或地面
```

### 8.3 平台 API 适配

| 能力 | Windows | macOS | Linux (X11) |
|------|---------|-------|-------------|
| 窗口枚举 | `EnumWindows` | `CGWindowListCopyWindowInfo` | `XQueryTree` + `_NET_CLIENT_LIST` |
| 鼠标穿透 | `WS_EX_TRANSPARENT` + 区域掩码 | `NSWindow.ignoresMouseEvents` | `XShapeCombineRectangles` |
| 任务栏检测 | `FindWindow("Shell_TrayWnd")` | Dock 检测受限* | `_NET_WM_STRUT` |
| 系统托盘 | `Shell_NotifyIcon` | `NSStatusBar` | `AppIndicator` |
| 活动窗口 | `GetForegroundWindow` | `NSWorkspace.frontmostApplication` | `_NET_ACTIVE_WINDOW` |

> *macOS Dock 有沙箱限制，需辅助功能权限。优先支持 Win/Linux 的任务栏行为，macOS 降级为屏幕底部区域活动。

Rust 侧封装 `PlatformProvider` trait，编译时 `#[cfg(target_os)]` 条件编译。

---

## 9. 对话系统

### 9.1 本地台词库

- **容量**: ~200 条预设台词
- **存储**: JSON 文件，按情境分类索引
- **情境分类**:
  - 问候 (启动/长时间不见)
  - 抚摸反应
  - 饥饿 (低/中/高)
  - 疲劳
  - 开心 (心情高)
  - 生气 (心情低/被忽视)
  - 时间相关 (早安/晚安/深夜)
  - 天气相关 (如果获取到)
  - 随机闲话
  - 代码相关 (检测到活跃编码窗口)

### 9.2 Claude API 智能对话 (可选)

- 用户在设置中配置 API Key
- 点击"聊天" → 气泡输入框 → 调用 Claude API
- 角色历史人格注入 System Prompt
- 不配置 API Key 时，"聊天"按钮灰色显示"需要配置 API Key"

---

## 10. 系统集成

### 10.1 系统托盘

- **图标**: Clawd 螃蟹像素小图标
- **菜单**:
  - 显示/隐藏桌宠
  - 喂食
  - 设置
  - 退出

### 10.2 开机自启

- Windows: 注册表 `HKCU\Software\Microsoft\Windows\CurrentVersion\Run`
- macOS: LaunchAgent plist
- Linux: `~/.config/autostart/` .desktop 文件
- 默认关闭，设置中可开启

### 10.3 数据持久化 (SQLite)

```sql
-- 养成状态表
CREATE TABLE pet_state (
    id INTEGER PRIMARY KEY DEFAULT 1,
    hunger REAL DEFAULT 50,
    energy REAL DEFAULT 80,
    mood REAL DEFAULT 70,
    affection REAL DEFAULT 0,
    last_save_time INTEGER NOT NULL,
    total_online_seconds INTEGER DEFAULT 0
);

-- 设置表
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- 解锁记录表
CREATE TABLE unlocks (
    unlock_id TEXT PRIMARY KEY,
    unlocked_at INTEGER NOT NULL
);
```

---

## 11. 性能策略

| 状态 | 帧率 | 功耗 |
|------|------|------|
| 🎯 活跃 (走动/攀爬/动画) | 60 fps | 正常 |
| 😴 静止 5 秒以上 | 10 fps | 低 |
| 💤 后台 30 秒以上 | 1 fps (仅心跳) | 极低 |
| ⏱️ 窗口枚举 | 2s 间隔 | - |

**目标**: 运行时内存 <80MB，空闲时 CPU <1%，有动画时 CPU <3%

---

## 12. 项目结构规划

```
clawd/
├── src-tauri/               # Rust 后端
│   ├── src/
│   │   ├── main.rs          # 入口
│   │   ├── lib.rs           # Tauri 插件注册
│   │   ├── window/          # 窗口管理模块
│   │   │   ├── mod.rs
│   │   │   ├── transparent.rs  # 透明置顶窗口
│   │   │   └── detection.rs    # 窗口枚举 & 边缘检测
│   │   ├── platform/        # 平台适配层
│   │   │   ├── mod.rs       # PlatformProvider trait
│   │   │   ├── windows.rs
│   │   │   ├── macos.rs
│   │   │   └── linux.rs
│   │   ├── tray.rs          # 系统托盘
│   │   ├── storage.rs       # SQLite 数据层
│   │   └── api.rs           # Claude API 代理 (可选)
│   ├── Cargo.toml
│   └── tauri.conf.json
├── src/                      # 前端 (TypeScript + PixiJS)
│   ├── index.html
│   ├── main.ts               # 入口，初始化 PixiJS App
│   ├── core/
│   │   ├── GameLoop.ts       # PixiJS Ticker 主循环
│   │   ├── SpriteEngine.ts   # 精灵管理 & 动画控制器
│   │   ├── StateMachine.ts   # 动画状态机
│   │   └── BehaviorTree.ts   # 行为树执行器
│   ├── systems/
│   │   ├── NurtureSystem.ts  # 养成数值管理
│   │   ├── MovementSystem.ts # 移动 & 物理
│   │   ├── ClimbSystem.ts    # 窗口攀爬逻辑
│   │   ├── InteractionSystem.ts # 鼠标交互处理
│   │   └── DialogSystem.ts   # 对话气泡 & 台词库
│   ├── actors/
│   │   └── Clawd.ts          # 角色主类（状态/动画/行为集合）
│   ├── ui/
│   │   ├── Bubble.ts         # 对话气泡组件
│   │   ├── StatusBar.ts      # 悬停状态条
│   │   └── Settings.ts       # 设置面板
│   ├── data/
│   │   ├── dialogs.json      # 本地台词库
│   │   └── sprites/          # 精灵表资源
│   └── utils/
│       ├── Palette.ts        # 调色板常量
│       └── EventBus.ts       # 内部事件总线
├── assets/
│   ├── sprites/
│   │   └── clawd-spritesheet.png   # 主精灵表
│   ├── icons/
│   │   └── tray-icon.png     # 托盘图标
│   └── sounds/               # 可选音效
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 13. 开发阶段规划

| 阶段 | 内容 | 交付物 |
|------|------|--------|
| **P0: MVP** | Tauri 透明窗口 + PixiJS 渲染 + idle 动画 + 拖拽 + 系统托盘 | 可运行的桌面宠物雏形 |
| **P1: 动画** | 完整精灵表 + 11 种动画状态机 + 粒子系统 | 角色可以展示全部动作 |
| **P2: 行为** | 随机游走 + 窗口枚举 + 基础攀爬 | 角色在桌面上自由活动 |
| **P3: 养成** | 4 维状态 + 好感度 + SQLite 持久化 | 完整的养成体验 |
| **P4: 对话** | 本地台词库 + 气泡 UI + Claude API 可选接入 | 智能对话能力 |
| **P5: 打磨** | 平台适配完善 + 性能优化 + 彩蛋 + 安装包 | 可分发版本 |

---

## 14. 未决项 (待后续细化)

- [ ] 音效系统方案 (音乐/音效/关闭选项)
- [ ] 首次启动引导教程设计
- [ ] 设置面板 UI 设计
- [ ] 多显示器跨屏移动策略
- [ ] 喂食系统交互细节 (食物种类/背包 UI)
- [ ] 精灵帧的具体美术资源制作
- [ ] 各平台打包签名流程

---

*文档结束。*
