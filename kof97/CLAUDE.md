# KOF 97 - 格斗游戏项目

一个基于 Phaser 3 + Expo 的跨平台格斗游戏，灵感来自拳皇 97。

## 技术栈

- **Phaser 3**: 2D 游戏引擎
- **Expo/React Native**: 跨平台应用框架
- **TypeScript**: 类型安全

## 平台支持

- ✅ Web (HTML5)
- 🔄 Android (WebView 包装)
- 🔄 iOS (WebView 包装)

## 快速开始

```bash
# 安装依赖
npm install

# Web 开发
npx expo start --web

# 移动端开发 (需要 Expo Go)
npx expo start

# 打包 Web 版本
npx expo export --platform web

# 打包 Android APK
eas build --platform android

# 打包 iOS
eas build --platform ios
```

## 项目结构

```
kof97/
├── App.tsx                 # 主应用入口
├── game/
│   ├── Game.ts            # 游戏配置
│   ├── index.ts           # 模块导出
│   ├── scenes/
│   │   ├── MainMenuScene.ts   # 主菜单
│   │   └── FightScene.ts      # 对战场景
│   ├── entities/
│   │   └── Fighter.ts     # 角色类
│   ├── systems/
│   │   ├── StateMachine.ts    # 状态机
│   │   ├── InputSystem.ts     # 输入系统
│   │   └── CombatSystem.ts    # 战斗系统
│   ├── config/
│   │   └── characters.ts  # 角色配置
│   └── assets/            # 游戏资源
└── app.json               # Expo 配置
```

## 游戏控制

### 键盘 (Web)
| 动作 | 按键 |
|------|------|
| 移动 | 方向键 / WASD |
| 轻拳 | Z |
| 中拳 | X |
| 重拳 | C |
| 轻脚 | , |
| 中脚 | . |
| 重脚 | / |

### 触摸 (移动端)
- 左侧：虚拟摇杆
- 右侧：6 个攻击按钮

## 核心系统

### 1. 角色状态机
```typescript
enum FighterState {
  IDLE, WALK_FORWARD, WALK_BACK,
  CROUCH, JUMP,
  ATTACK_*, BLOCK, HIT, KNOCKDOWN
}
```

### 2. 招式系统
每个招式包含:
- `startup`: 发动帧数
- `active`: 有效帧数
- `recovery`: 恢复帧数
- `damage`: 伤害值
- `hitStun`: 硬直帧数

### 3. 输入缓冲
支持指令输入检测：
- 波动拳：↓↘→ + P
- 升龙拳：→↓↘ + P

## 当前实现

- [x] 基础框架 (Expo + Phaser)
- [x] 角色移动 (走、跳、蹲)
- [x] 攻击系统 (6 种攻击)
- [x] 碰撞检测
- [x] 血条 UI
- [x] 简单 AI
- [ ] 精灵动画 (使用占位图)
- [ ] 必杀技
- [ ] 连招系统
- [ ] 音效
- [ ] 角色选择界面

## 后续开发

### Phase 1: 完善基础
1. 替换占位图为实际精灵
2. 添加更多角色
3. 实现必杀技指令

### Phase 2: 游戏模式
1. 角色选择界面
2. 生涯模式
3. 在线对战

### Phase 3: 优化
1. 性能优化
2. 输入延迟优化
3. 网络同步

## 添加新角色

1. 在 `game/config/characters.ts` 添加角色配置
2. 创建角色精灵图
3. 在 `FightScene` 中注册

## 调试

```bash
# 开启物理调试
// 在 FightScene.ts 中设置 debug: true
arcade: {
  gravity: { y: 800 },
  debug: true,  // 显示碰撞盒
}
```

## 参考资料

- [Phaser 3 文档](https://photonstorm.github.io/phaser3-docs/)
- [Expo 文档](https://docs.expo.dev/)
- [格斗游戏帧数据](https://www.dustloop.com/)
