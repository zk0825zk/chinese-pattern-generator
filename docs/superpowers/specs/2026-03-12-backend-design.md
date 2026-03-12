# 中国传统纹样生成器 — 后端设计文档

> 日期：2026-03-12
> 状态：已确认

## 1. 背景与目标

当前项目是纯前端应用（Next.js 16 + React 19 + TypeScript + TailwindCSS），所有纹样生成在浏览器端完成，历史记录仅存 localStorage。

本次后端设计的目标：

1. **用户系统 + 云端保存**：用户注册登录、纹样作品持久化存储、跨设备同步
2. **AI 纹样生成**：接入第三方 AI 图像生成服务，支持可插拔适配层

## 2. 技术选型

| 维度 | 选择 | 理由 |
|------|------|------|
| 后端框架 | Next.js API Routes | 前后端一体化，无需额外服务 |
| 数据库 | SQLite (Prisma ORM) | 轻量级，自托管友好；Prisma 提供类型安全查询和迁移工具 |
| 认证方式 | 用户名 + 密码 + JWT | 简单直接，无第三方依赖 |
| 密码哈希 | bcryptjs | 纯 JS 实现，无需编译原生模块 |
| JWT 库 | jose | 支持 Edge Runtime，兼容性好 |
| AI 方案 | 第三方 API + 可插拔适配层 | 灵活切换服务商，无需 GPU |
| 部署方式 | 自托管服务器 | SQLite 可直接使用，完全可控 |

## 3. 整体架构

```
┌──────────────────────────────────────────────────┐
│                   Next.js App                     │
│                                                   │
│  ┌─────────────┐         ┌─────────────────────┐ │
│  │  前端 React  │ ──────▶│  API Routes (/api)   │ │
│  │  Components  │ ◀──────│                       │ │
│  └─────────────┘         │  ┌───────────────┐   │ │
│                           │  │ Auth 中间件    │   │ │
│                           │  │ (JWT 验证)     │   │ │
│                           │  └───────────────┘   │ │
│                           │          │            │ │
│                           │  ┌───────┴───────┐   │ │
│                           │  │  业务逻辑层    │   │ │
│                           │  └───────┬───────┘   │ │
│                           └──────────┼───────────┘ │
│                                ┌─────┴─────┐       │
│                           ┌────┤           ├────┐  │
│                           ▼    ▼           ▼    ▼  │
│                      ┌──────┐ ┌────┐ ┌────────┐   │
│                      │Prisma│ │FS  │ │AI 适配 │   │
│                      │  +   │ │存储│ │  层    │   │
│                      │SQLite│ │    │ │        │   │
│                      └──────┘ └────┘ └────────┘   │
└──────────────────────────────────────────────────┘
```

**核心原则**：

- API 路由只做参数校验和响应格式化，业务逻辑放在 lib 层
- Prisma 统一管理数据访问，提供类型安全
- AI 适配层通过接口抽象，工厂模式创建具体实现
- JWT 无状态认证，中间件统一鉴权
- 前后端一体化部署，无需 CORS 配置（如未来分离部署，需在 Next.js 中间件中添加 CORS headers）

## 4. 新增目录结构

```
├── prisma/
│   ├── schema.prisma          # 数据模型定义
│   └── migrations/            # 数据库迁移
├── app/api/                   # API 路由
│   ├── auth/
│   │   ├── register/route.ts  # POST 注册
│   │   ├── login/route.ts     # POST 登录
│   │   └── me/route.ts        # GET 当前用户
│   ├── patterns/
│   │   ├── route.ts           # GET 列表 / POST 保存
│   │   └── [id]/route.ts      # GET/PUT/DELETE 单个
│   └── ai/
│       ├── generate/route.ts  # POST 发起生成
│       └── tasks/[id]/route.ts # GET 查询任务状态
├── lib/
│   ├── db.ts                  # Prisma Client 单例
│   ├── auth.ts                # JWT 签发/验证/中间件
│   └── ai/
│       ├── adapter.ts         # AI 适配器接口
│       ├── factory.ts         # 适配器工厂
│       └── providers/         # 具体实现
│           ├── openai.ts      # OpenAI
│           ├── gemini.ts      # Gemini
│           └── local.ts       # 本地模型
└── uploads/                   # 文件存储目录（可选）
```

## 5. 数据库 Schema

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum PatternType {
  cloud
  meander
  floral
  geometric
  dragon
}

enum AiTaskStatus {
  pending
  processing
  completed
  failed
}

enum AiProvider {
  openai
  gemini
  local
}

model User {
  id           String    @id @default(cuid())
  username     String    @unique
  passwordHash String
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  patterns     Pattern[]
  aiTasks      AiTask[]
}

model Pattern {
  id         String      @id @default(cuid())
  userId     String
  user       User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  name       String      @default("未命名纹样")
  type       PatternType
  params     String
  svg        String
  thumbnail  String?
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
  aiTasks    AiTask[]

  @@index([userId, createdAt])
}

model AiTask {
  id         String       @id @default(cuid())
  userId     String
  user       User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  patternId  String?
  pattern    Pattern?     @relation(fields: [patternId], references: [id], onDelete: SetNull)
  prompt     String
  status     AiTaskStatus @default(pending)
  result     String?      // 任务输出内容或资源引用
  error      String?
  provider   AiProvider
  createdAt  DateTime     @default(now())
  updatedAt  DateTime     @updatedAt

  @@index([userId, status])
  @@index([patternId])
}
```

**设计要点**：

- **enum 约束说明**：SQLite 不支持原生 enum 类型，Prisma 会将 enum 映射为 String 存储。约束在应用层（Prisma Client TypeScript 类型检查）生效，直接操作数据库时无约束。如需数据库层约束，可在迁移脚本中手动添加 CHECK 约束。
- User 删除时级联清理 Pattern 和 AiTask（onDelete: Cascade）
- AiTask 通过 patternId 关联最终生成的 Pattern；删除 Pattern 时置空（onDelete: SetNull）
- Pattern.params 用 JSON 字符串存完整 PatternParams，保持灵活性
- Pattern.svg 直接存 SVG 文本，SQLite TEXT 字段无大小限制
- cuid() 主键，不暴露记录数量
- 复合索引优化常见查询路径
- **前后端类型同步**：PatternType enum 的值必须与前端 `generators/types.ts` 中的 `PatternType` 联合类型保持一致。实现时应从前端类型定义派生或共享常量，确保两端一致。

## 6. 认证系统

### 6.1 技术实现

- 密码哈希：bcryptjs（saltRounds=10）
- JWT 签发/验证：jose 库
- Token 有效期：7 天

### 6.2 JWT Payload

```typescript
interface JwtPayload {
  sub: string;   // userId
  iat: number;   // 签发时间
  exp: number;   // 过期时间
}
```

### 6.3 认证流程

- **注册**：校验用户名格式和唯一性 → bcrypt hash 密码 → 创建 User → 签发 JWT
- **登录**：查找用户 → bcrypt verify 密码 → 签发 JWT
- **鉴权**：请求头 `Authorization: Bearer <token>` → jose 验证签名和过期时间 → 提取 userId 注入 handler

### 6.4 中间件

```typescript
function withAuth(handler: AuthedHandler): (req: NextRequest) => Promise<NextResponse>
```

从 request headers 提取并验证 JWT，未登录或 token 无效返回 401。

### 6.5 输入校验规则

- **用户名**：3-20 字符，仅允许字母、数字、下划线，不区分大小写（存储时统一转小写）
- **密码**：最少 8 字符，无上限限制

### 6.6 Token 安全限制

当前采用纯 JWT 无状态方案，已知限制：

- Token 一旦签发无法撤销，在有效期内始终有效
- 如 Token 泄露，攻击窗口为整个 7 天有效期
- 暂不引入 Refresh Token 机制，保持实现简洁。如未来需要更强的安全控制，可引入短期 Access Token（15 分钟）+ 长期 Refresh Token（7 天）的双 Token 方案。

## 7. API 路由

| 路由 | 方法 | 鉴权 | 功能 |
|------|------|------|------|
| `/api/auth/register` | POST | 无（限流） | 注册新用户 |
| `/api/auth/login` | POST | 无（限流） | 登录获取 JWT |
| `/api/auth/me` | GET | 需要 | 获取当前用户信息 |
| `/api/patterns` | GET | 需要 | 获取用户纹样列表（分页） |
| `/api/patterns` | POST | 需要 | 保存新纹样 |
| `/api/patterns/[id]` | GET | 需要 | 获取单个纹样详情 |
| `/api/patterns/[id]` | PUT | 需要 | 更新纹样（名称等） |
| `/api/patterns/[id]` | DELETE | 需要 | 删除纹样 |
| `/api/ai/generate` | POST | 需要（限流） | 发起 AI 生成任务 |
| `/api/ai/tasks/[id]` | GET | 需要 | 查询 AI 任务状态 |

### 7.1 分页约定

纹样列表 API 采用页码分页：

```
请求：GET /api/patterns?page=1&limit=20
响应：{
  data: Pattern[],
  total: number,
  page: number,
  limit: number
}
```

- `page` 默认 1，`limit` 默认 20，最大 100
- 按 createdAt 降序排列

## 8. AI 适配层

### 8.1 统一接口

```typescript
interface AiGenerateRequest {
  prompt: string;
  style?: string;
  width?: number;
  height?: number;
}

interface AiGenerateResult {
  imageUrl?: string;
  imageBase64?: string;
  metadata?: Record<string, unknown>;
}

interface AiAdapter {
  readonly provider: AiProvider;
  generate(request: AiGenerateRequest): Promise<AiGenerateResult>;
  checkStatus?(taskId: string): Promise<AiGenerateResult>;
}
```

### 8.2 工厂模式

```typescript
function createAiAdapter(provider: AiProvider): AiAdapter
```

根据 AiProvider 枚举值创建对应的适配器实例。初期提供 OpenAI 和 Gemini 适配器，local 为本地模型预留。新增服务商只需实现 AiAdapter 接口并在工厂注册。

### 8.3 生成流程

1. 用户提交 prompt → 创建 AiTask（status: pending）
2. 后端调用 AiAdapter.generate()
3. 同步返回：直接更新 AiTask（status: completed）
4. 异步任务：更新为 processing，前端轮询 `/api/ai/tasks/[id]`
5. 完成后将结果存入 AiTask.result，可选关联到 Pattern

### 8.4 任务超时与清理

- 任务超时时间：5 分钟。超过 5 分钟仍为 `processing` 的任务自动标记为 `failed`（error: "任务超时"）
- 超时检查时机：在查询任务状态的 API 中顺带检查（懒清理），无需独立定时任务
- 前端轮询最大次数：30 次（每 10 秒一次，共 5 分钟），超时后停止轮询并提示用户

### 8.5 配置管理

各服务商 API Key 通过环境变量配置（`.env.local`），不硬编码：

```
AI_OPENAI_API_KEY=""
AI_GEMINI_API_KEY=""
```

## 9. 安全措施

- **密码存储**：bcryptjs 哈希，永不存明文
- **JWT 安全**：secret 从环境变量读取，7 天有效期（详见 6.6 节限制说明）
- **鉴权拦截**：withAuth 中间件统一处理，未登录返回 401
- **数据隔离**：所有查询强制带 userId 条件，用户只能访问自己的数据
- **输入校验**：用户名格式（3-20 字符，字母数字下划线）、密码最小长度（8 字符）、请求参数类型和范围校验
- **速率限制**：
  - 注册接口：基于 IP，每 IP 每小时最多 10 次
  - 登录接口：基于 IP，每 IP 每分钟最多 10 次；连续失败 5 次后该账户锁定 15 分钟
  - AI 生成接口：基于用户，每用户每分钟最多 5 次
  - **实现方式**：内存计数（Map），适用于当前单实例自托管场景。如未来多实例部署，需迁移到持久化方案（如 SQLite 表或 Redis）

## 10. 错误处理

- **统一响应格式**：`{ error: string, code?: string }`
- **数据库错误**：捕获 Prisma 异常，返回友好提示
- **AI 调用失败**：记录到 AiTask.error，前端展示失败原因
- **未预期异常**：catch-all 返回 500 + 通用提示

## 11. 环境变量

```
DATABASE_URL="file:./prisma/data.db"
JWT_SECRET="your-secret-key"
AI_OPENAI_API_KEY=""
AI_GEMINI_API_KEY=""
```

## 12. 新增依赖

```json
{
  "dependencies": {
    "@prisma/client": "^6.x",
    "bcryptjs": "^2.4.3",
    "jose": "^5.x"
  },
  "devDependencies": {
    "prisma": "^6.x",
    "@types/bcryptjs": "^2.4.x"
  }
}
```
