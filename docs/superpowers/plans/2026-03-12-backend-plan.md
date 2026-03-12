# 后端实施计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为中国传统纹样生成器添加后端，支持用户系统、云端保存和 AI 纹样生成。

**Architecture:** 在现有 Next.js 16 前端基础上，利用 API Routes 构建后端。Prisma ORM + SQLite 管理数据，JWT 无状态认证，可插拔 AI 适配层对接第三方图像生成服务。

**Tech Stack:** Next.js 16 API Routes, Prisma 6 + SQLite, bcryptjs, jose (JWT), Vitest

**Spec:** `docs/superpowers/specs/2026-03-12-backend-design.md`

**Note:** API 路由集成测试留待下一阶段，当前阶段聚焦核心库单元测试。

---

## Chunk 1: Infrastructure Setup

### Task 1: Install Dependencies and Configure Prisma

**Files:**
- Modify: `package.json`
- Create: `prisma/schema.prisma`
- Create: `.env.example`
- Create: `.env.local` (本地，不提交)

- [ ] **Step 1: Install runtime dependencies**

```bash
npm install @prisma/client bcryptjs jose
```

- [ ] **Step 2: Install dev dependencies**

```bash
npm install -D prisma @types/bcryptjs
```

- [ ] **Step 3: Create `.env.example` (提交到 git 作为参考)**

```
DATABASE_URL="file:./prisma/data.db"
JWT_SECRET="change-me-to-a-random-string-at-least-32-chars"
AI_OPENAI_API_KEY=""
AI_GEMINI_API_KEY=""
```

- [ ] **Step 4: Create `.env.local` (本地使用，不提交)**

```
DATABASE_URL="file:./prisma/data.db"
JWT_SECRET="dev-secret-change-in-production-min-32-chars!!"
AI_OPENAI_API_KEY=""
AI_GEMINI_API_KEY=""
```

- [ ] **Step 5: Create `prisma/schema.prisma`**

注意：SQLite 不支持 enum，所有枚举字段使用 String 类型，在应用层校验。

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
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
  id         String    @id @default(cuid())
  userId     String
  user       User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  name       String    @default("未命名纹样")
  type       String
  params     String
  svg        String
  thumbnail  String?
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
  aiTasks    AiTask[]

  @@index([userId, createdAt])
}

model AiTask {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  patternId  String?
  pattern    Pattern? @relation(fields: [patternId], references: [id], onDelete: SetNull)
  prompt     String
  status     String   @default("pending")
  result     String?
  error      String?
  provider   String
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([userId, status])
  @@index([patternId])
}
```

- [ ] **Step 6: Run Prisma migration**

```bash
npx prisma migrate dev --name init
```

- [ ] **Step 7: Add to `.gitignore`**

Append:
```
prisma/data.db
prisma/data.db-journal
```

- [ ] **Step 8: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/ .env.example .gitignore package.json package-lock.json
git commit -m "feat: 初始化 Prisma + SQLite 数据库配置"
```

### Task 2: Prisma Client Singleton

- [ ] **Step 1: Create `lib/db.ts`**
- [ ] **Step 2: Commit**

### Task 3: Shared Constants (前后端类型同步)

- [ ] **Step 1: Modify `generators/types.ts` 导出 PATTERN_TYPES 常量**
- [ ] **Step 2: Commit**

### Task 4: Input Validation (TDD)

- [ ] **Step 1-5: 先写测试 → 验证失败 → 实现 → 验证通过 → 提交**

### Task 5: Rate Limiter (TDD)

- [ ] **Step 1-5: 先写测试 → 验证失败 → 实现 → 验证通过 → 提交**

### Task 6: Auth Library (TDD)

- [ ] **Step 1-5: 先写测试 → 验证失败 → 实现 → 验证通过 → 提交**

## Chunk 2: Auth API Routes (Task 7-9)
## Chunk 3: Patterns CRUD API (Task 10-11)
## Chunk 4: AI Adapter Layer (Task 12-14)
## Task 15: Final Verification
