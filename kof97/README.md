# KOF 97 风格的格斗游戏

一个使用 Phaser 3 + Expo 开发的跨平台格斗游戏，灵感来自经典拳皇 97。

## 🎮 特性

- ✅ 支持 Web、Android、iOS 三平台
- ✅ 60FPS 流畅格斗体验
- ✅ 完整的战斗系统（攻击、防御、连招）
- ✅ 虚拟摇杆 + 键盘双控制方案
- ✅ 简单 AI 对手
- ✅ 血条 UI、连击计数

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 运行 Web 版本

```bash
npx expo start --web
```

访问 http://localhost:8081 开始游戏

### 运行移动端

```bash
# 安装 Expo Go 应用
# 然后运行：
npx expo start
# 扫描二维码
```

### 打包发布

```bash
# Web 构建
npx expo export --platform web

# Android APK
eas build --platform android

# iOS
eas build --platform ios
```

## 🎮 游戏控制

### Web (键盘)

| 操作 | 按键 |
|------|------|
| 移动 | 方向键 / WASD |
| 轻拳 | Z |
| 中拳 | X |
| 重拳 | C |
| 轻脚 | , |
| 中脚 | . |
| 重脚 | / |

### 移动端 (触摸)

- **左侧**: 虚拟摇杆（移动/跳跃）
- **右侧**: 6 个攻击按钮 (LP/MP/HP/LK/MK/HK)

## 📁 项目结构

```
kof97/
├── App.tsx                    # 主应用入口
├── game/
│   ├── Game.ts                # Phaser 游戏配置
│   ├── index.ts               # 模块导出
│   ├── scenes/
│   │   ├── MainMenuScene.ts   # 主菜单场景
│   │   └── FightScene.ts      # 对战场景
│   ├── entities/
│   │   └── Fighter.ts         # 角色实体类
│   ├── systems/
│   │   ├── StateMachine.ts    # 状态机系统
│   │   ├── InputSystem.ts     # 输入处理系统
│   │   ├── CombatSystem.ts    # 战斗碰撞系统
│   │   └── InputBuffer.ts     # 输入缓冲
│   ├── config/
│   │   └── characters.ts      # 角色配置数据
│   └── assets/                # 游戏资源（待添加）
├── app.json                   # Expo 配置
├── package.json               # 依赖管理
├── tsconfig.json              # TypeScript 配置
└── CLAUDE.md                  # 开发文档
```

## 🥊 角色系统

### 当前可用角色

1. **Kyo Kusanagi (草薙京)**
   - 平衡型角色
   - 特殊技：108 式暗拂（飞行道具）
   - 超必杀：大蛇薙

2. **Terry Bogard (饿狼)**
   - 力量型角色
   - 特殊技：力量波浪
   - 超必杀：力量喷泉

### 招式框架

每个招式包含帧数据:
- `startup`: 发动帧数
- `active`: 有效帧数  
- `recovery`: 恢复帧数
- `damage`: 伤害值
- `hitStun`: 命中硬直
- `blockStun`: 防御硬直
- `knockdown`: 是否击倒

## 🏗️ 核心系统

### 1. 状态机 (StateMachine.ts)

管理角色状态转换:
```
IDLE → WALK → ATTACK → IDLE
         ↓
       CROUCH → BLOCK
         ↓
        JUMP → KNOCKDOWN
```

### 2. 输入系统 (InputSystem.ts)

- 键盘输入处理
- 触摸虚拟摇杆
- 输入缓冲（支持指令输入）
- 必杀技指令检测

### 3. 战斗系统 (CombatSystem.ts)

- Hitbox vs Hurtbox 碰撞检测
- 伤害计算
- 连击计数
- 受击反馈（镜头震动、粒子效果）

### 4. 角色实体 (Fighter.ts)

- 物理模拟（重力、跳跃）
- 移动控制
- 攻击判定
- 动画状态同步

## 📋 开发清单

### 已完成
- [x] 基础框架 (Expo + Phaser)
- [x] 角色移动 (走、跳、蹲)
- [x] 攻击系统 (6 种攻击)
- [x] 碰撞检测
- [x] 血条 UI
- [x] 简单 AI
- [x] 输入系统（键盘 + 触摸）

### 待开发
- [ ] 精灵动画（当前使用占位图）
- [ ] 必杀技指令输入
- [ ] 完整连招系统
- [ ] 角色选择界面
- [ ] 更多角色
- [ ] 音效/BGM
- [ ] 在线对战
- [ ] 生涯模式

## 🔧 开发技巧

### 调试模式

在 `FightScene.ts` 中开启物理调试:
```typescript
arcade: {
  gravity: { x: 0, y: 800 },
  debug: true,  // 显示碰撞盒
}
```

### 添加新角色

1. 在 `game/config/characters.ts` 添加配置
2. 创建角色精灵图
3. 在 `FightScene` 中注册

### 性能优化

- 使用纹理图集减少 Draw Call
- 限制同屏粒子数量
- 对象池复用

## 🎯 后续规划

### Phase 1: 完善基础 (1-2 周)
- 替换占位图为实际精灵
- 添加必杀技动画
- 完善 AI 行为树

### Phase 2: 游戏内容 (2-3 周)
- 角色选择界面
- 更多可玩角色
- 生涯/街机模式

### Phase 3: 优化发布 (1 周)
- 性能优化
- 输入延迟优化
- 打包发布

## 📝 许可证

本项目仅供学习交流使用。
拳皇 SNK 所有，本作品为粉丝创作。

## 🤝 贡献

欢迎提交 Issue 和 PR！

---

**开发中遇到问题？**
查看 [CLAUDE.md](./CLAUDE.md) 获取详细开发文档。
