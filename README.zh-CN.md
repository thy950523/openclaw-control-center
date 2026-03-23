> Looking for English? Start here: [Open the English README](README.md)

# OpenClaw Control Center

<img src="docs/assets/overview-hero-zh.png" alt="OpenClaw Control Center 总览横幅截图" width="1200" />

把 OpenClaw 从黑箱变成一个看得清、信得过、控得住的本地控制中心。

语言： [English](README.md) | **中文**

## 这个项目是做什么的
- 给 OpenClaw 提供一个本地控制中心，集中看系统是否稳定、谁在工作、哪些任务卡住了、今天花了多少。
- 面向非技术用户，重点是“看得懂、看得准”，不是暴露原始后端 payload。
- 首次接入默认安全：
  - 默认只读
  - 默认本地 token 鉴权
  - 默认关闭高风险写操作

## 你能得到什么
- `总览`：系统状态、待处理事项、关键风险和运营摘要
- `用量`：用量、花费、订阅窗口和连接状态
- `员工`：谁真的在工作，谁只是排队待命
- `协作`：父子会话接力与智能体之间的跨会话通信
- `任务`：当前任务、审批、执行链和运行证据
- `文档` 与 `记忆`：按活跃 OpenClaw agent 范围展示的源文件工作台

## 这个版本新增了什么
- `协作`：新增独立 `协作` 页面，直接看父子会话接力和 `Main ⇄ Pandas` 这种已验证跨会话通信，不再只看执行链猜关系。
- `设置`：新增 `接线状态`，直接告诉你哪些数据已经接好、哪些还差一步，以及该去哪里补。
- `设置`：新增 `安全风险摘要`，把当前风险、影响和下一步建议翻译成人话。
- `设置`：新增 `更新状态`，直接看当前版本、最新版本、更新通道和安装方式。
- `用量`：新增 `上下文压力`，直接看哪些会话更接近上下文上限，哪里可能变慢或变贵。
- `记忆`：新增 `记忆状态`，直接看每个智能体的记忆是否可用、可搜索、需不需要检查。

## 适合谁
- 已经在用 OpenClaw、想要一个统一控制中心的团队或个人
- 在同一台机器或可达本地环境里运行 OpenClaw 的使用者
- 想公开发布一个安全优先的 OpenClaw 控制台，而不是做通用 agent 平台的人

## 截图
以下截图来自一个本地 OpenClaw 环境：

<table>
  <tr>
    <td width="56%">
      <img src="docs/assets/token-share-zh.png" alt="OpenClaw Control Center 中文 token 消耗归因截图" width="100%" />
    </td>
    <td width="44%">
      <img src="docs/assets/staff-zh.png" alt="OpenClaw Control Center 中文员工页截图" width="100%" />
    </td>
  </tr>
  <tr>
    <td><strong>Token 消耗归因</strong><br />直接看定时任务 token 是被哪些任务吃掉的，占比一眼可见。</td>
    <td><strong>员工页</strong><br />直接看谁在工作、谁待命、最近产出和排班状态。</td>
  </tr>
</table>

<table>
  <tr>
    <td width="56%">
      <img src="docs/assets/collaboration-zh.png" alt="OpenClaw Control Center 中文协作页截图" width="100%" />
    </td>
    <td width="44%">
      <img src="docs/assets/settings-insights-zh.png" alt="OpenClaw Control Center 中文安全与更新状态截图" width="100%" />
    </td>
  </tr>
  <tr>
    <td><strong>协作页</strong><br />直接看父子会话接力，以及像 <code>Main ⇄ Pandas</code> 这样的已验证跨会话通信。</td>
    <td><strong>安全与更新状态</strong><br />直接看当前风险、影响、下一步建议，以及当前版本和最新版本。</td>
  </tr>
</table>

## 5 分钟启动
```bash
npm install
cp .env.example .env
npm run build
npm test
npm run smoke:ui
npm run dev:ui
```

然后打开：
- `http://127.0.0.1:4310/?section=overview&lang=zh`
- `http://127.0.0.1:4310/?section=overview&lang=en`

说明：
- 推荐用 `npm run dev:ui` 启动界面；它比 `UI_MODE=true npm run dev` 更稳，尤其是 Windows shell。
- `npm run dev` 只会执行一次 monitor，不会启动 HTTP UI。

## 身份验证（可选）
OpenClaw 控制中心支持可选的用户名/密码身份验证功能。

### 前置条件
1. **Supabase**：在 [supabase.com](https://supabase.com) 创建一个项目
2. **Redis**：设置一个 Redis 实例（本地或云服务如 Redis Labs）

### 数据库设置
在 Supabase SQL 编辑器中运行以下 SQL 创建身份验证表：

```sql
-- 创建 users 表
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(10) CHECK (role IN ('admin', 'user')) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- 启用行级安全策略
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
```

### 配置
在 `.env` 文件中添加以下配置：

```bash
# 启用身份验证
AUTH_ENABLED=true

# Supabase 配置（来自你的 Supabase 项目）
AUTH_SUPABASE_URL=https://your-project.supabase.co
AUTH_SUPABASE_KEY=your-anon-key

# Redis 配置
AUTH_REDIS_HOST=your-redis-host
AUTH_REDIS_PORT=6379

# 会话设置（可选）
AUTH_SESSION_TTL_SECONDS=7200
AUTH_COOKIE_NAME=openclaw_session
```

### 初始化管理员账号
创建管理员账户：

```bash
npm run init:admin -- --username admin --password 你的密码
```

参数说明：
- `--username` - 用户名（默认：admin）
- `--password` - 密码（默认：admin123）
- `--role` - 角色：admin 或 user（默认：admin）

### 开发命令
```bash
# 启用身份验证后启动 UI
npm run dev:ui

# 创建新用户
npm run init:admin -- --username 新用户名 --password 新密码 --role user

# 测试登录
curl -X POST http://127.0.0.1:4310/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"你的密码"}'
```

### API 接口
- `POST /api/auth/login` - 登录
- `POST /api/auth/logout` - 登出
- `GET /api/auth/me` - 获取当前用户信息
- `GET /api/auth/verify` - 验证会话

## 生产环境部署

### 前置条件
- Node.js 20+
- Redis（用于会话存储）
- Supabase 项目（用于用户数据）

### 生产环境构建
```bash
# 安装依赖
npm install

# 构建 TypeScript
npm run build

# 构建产物在 dist/ 目录
```

### 生产环境部署选项

#### 选项 1：直接运行
```bash
# 设置生产环境
NODE_ENV=production

# 启动 UI 服务器
UI_MODE=true node dist/src/index.js
```

#### 选项 2：使用进程管理器 (PM2)
```bash
# 安装 PM2
npm install -g pm2

# 使用 PM2 启动
pm2 start dist/src/index.js --name openclaw-cc -- \
  UI_MODE=true
```

#### 选项 3：Docker 部署
创建 `Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm install

# 构建
RUN npm run build

# 环境变量
ENV NODE_ENV=production
ENV UI_MODE=true

# 暴露端口
EXPOSE 4310

# 启动
CMD ["node", "dist/src/index.js"]
```

构建和运行：
```bash
docker build -t openclaw-control-center .
docker run -d -p 4310:4310 \
  -e GATEWAY_URL=ws://your-gateway:18789 \
  -e AUTH_ENABLED=true \
  -e AUTH_SUPABASE_URL=... \
  -e AUTH_SUPABASE_KEY=... \
  -e AUTH_REDIS_HOST=... \
  openclaw-control-center
```

### 生产环境变量配置
```bash
# 核心配置
UI_MODE=true
UI_PORT=4310
UI_BIND_ADDRESS=0.0.0.0  # 允许外部连接

# 网关配置
GATEWAY_URL=ws://your-openclaw-gateway:18789

# 身份验证（生产环境建议启用）
AUTH_ENABLED=true
AUTH_SUPABASE_URL=https://your-project.supabase.co
AUTH_SUPABASE_KEY=your-anon-key
AUTH_REDIS_HOST=your-redis-host
AUTH_REDIS_PORT=6379
AUTH_SESSION_TTL_SECONDS=7200
AUTH_COOKIE_NAME=openclaw_session
```

### 安全注意事项
1. **使用 HTTPS** - 在反向代理（nginx、Caddy 或云负载均衡器）后运行
2. **保护 Redis** - 使用密码保护的 Redis 或专用网络
3. **Cookie 安全** - 生产环境设置 `Secure` 标志（当 `NODE_ENV=production` 时自动启用）
4. **防火墙** - 仅允许受信任网络访问 4310 端口
5. **保持 AUTH_ENABLED=true** - 生产环境始终启用身份验证

### 反向代理示例 (nginx)
```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:4310;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 分区功能说明

### 总览
- 给非技术用户看的主操作页。
- 集中展示当前总控态势、待处理事项、运行异常、停滞执行、预算风险、谁在忙、哪些地方需要优先关注。
- 最适合快速回答一句话：`OpenClaw 现在整体正常吗？`

### 用量
- 展示今日、7 天、30 天的用量和花费趋势。
- 包含订阅窗口、配额消耗、用量结构、上下文压力和数据连接状态。
- 最适合判断花费或额度是否开始有风险。

### 员工
- 展示谁现在真的在工作，谁只是有排队中的任务。
- 明确区分“正在执行”和“下一项”，避免把 backlog 误认为正在跑。
- 最适合判断谁忙、谁闲、谁卡住、谁在等待。

### 协作
- 独立展示智能体之间怎么交接、谁先接单、谁派给了谁、回复从哪条会话回来。
- 既能看父会话与子会话的接力，也能看 `sessions_send` / `inter-session message` 这类已验证跨会话通信。
- 最适合理解“这件事到底是谁转给了谁、现在卡在谁这里”。

### 记忆
- 一个直接基于源文件的记忆工作台，用来查看和编辑每日记忆与长期记忆。
- 范围跟随 `openclaw.json` 里的活跃 agent，不会把已删除 agent 继续显示出来。
- 现在还会直接告诉你每个智能体的记忆是否正常、可搜索、是否需要检查。
- 最适合查看或维护当前 OpenClaw 团队真实在用的记忆内容。

### 文档
- 一个直接基于源文件的文档工作台，用来查看和编辑共享文档与 agent 核心文档。
- 打开的是实际源文件，保存后也直接写回同一个源文件。
- 最适合维护系统背后真正生效的工作文档。

### 任务
- 把任务板、排期、审批、执行链和运行证据放在同一个分区里。
- 能帮助区分哪些只是看板映射，哪些已经有真实执行证据，哪些任务卡住了、需要跟进或待审。
- 最适合理解“现在到底在做什么、只是计划了什么、哪些需要你介入”。

### 设置
- 展示安全模式、连接器状态和数据链路预期。
- 会明确告诉你哪些数据已经接上，哪些还只是部分可见，哪些高风险动作是故意关闭的。
- 现在还包含 `接线状态`、`安全风险摘要` 和 `更新状态` 三张关键卡片。
- 最适合排查环境配置、解释为什么某些信号缺失。

## 这不是什么
- 不是 OpenClaw 本体的替代品
- 不是面向所有 agent 技术栈的通用平台
- 不是托管式 SaaS 控制台

## 核心约束
- 只修改 `control-center/` 目录内的文件
- 默认 `READONLY_MODE=true`
- 默认 `LOCAL_TOKEN_AUTH_REQUIRED=true`
- 默认 `IMPORT_MUTATION_ENABLED=false`
- 默认 `IMPORT_MUTATION_DRY_RUN=false`
- 开启鉴权时，导入/导出和所有改状态接口都需要本地 token
- 审批动作有硬开关，默认关闭：`APPROVAL_ACTIONS_ENABLED=false`
- 审批动作默认 dry-run：`APPROVAL_ACTIONS_DRY_RUN=true`
- 不会改写 `~/.openclaw/openclaw.json`

## 快速开始
1. `npm install`
2. `cp .env.example .env`
3. 第一次接入尽量保持安全默认值；只有在你的 OpenClaw 环境不是默认路径时，再改 `GATEWAY_URL` 或路径覆盖项
4. `npm run build`
5. `npm test`
6. `npm run smoke:ui`
7. `npm run dev:ui`

## 安装与上手

### 1. 开始前准备
你最好已经有：
- 一个可用的 OpenClaw 安装
- 一个可连接的 OpenClaw Gateway
- 当前机器上的 `node` 和 `npm`
- 对 OpenClaw 主目录的读取权限

如果你希望 `用量 / 订阅` 信息更完整，当前机器最好还能读到：
- `~/.openclaw`
- `~/.codex`
- OpenClaw 订阅快照文件，尤其是它不在默认位置时

### 2. 安装项目
```bash
git clone https://github.com/TianyiDataScience/openclaw-control-center.git
cd openclaw-control-center
npm install
cp .env.example .env
```

如果 OpenClaw 说“仓库缺少 `src/runtime`”或“缺少核心源码”，先不要改代码。这个仓库的标准结构本来就包含：
- `package.json`
- `src/runtime`
- `src/ui`
- `.env.example`

这类报错通常意味着：
- 当前目录不是 `openclaw-control-center` 仓库根目录
- clone 到了错误仓库
- checkout / 下载不完整
- agent 在错误 workspace 里执行

### 3. 默认推荐：让你自己的 OpenClaw 直接完成安装与接线
最推荐的接入方式，不是你手动一项项配，而是直接把下面这段安装指令交给你自己的 OpenClaw。

如果你想直接复制独立文件，用这个：
- [INSTALL_PROMPT.md](INSTALL_PROMPT.md)
- [INSTALL_PROMPT.en.md](INSTALL_PROMPT.en.md)

它应该一次性帮你做完这些事：
- 检查本机 OpenClaw / Gateway / 路径
- 安装依赖
- 创建或修正 `.env`
- 保持安全默认值
- 跑 `build / test / smoke`
- 告诉你最后该执行什么命令、该看哪些页面

这段安装指令已经考虑了这些常见情况：
- 用户没有 GPT / Codex 订阅，或者没有可读的订阅快照
- 用户的 OpenClaw 底层不是订阅，而是 API key / 其他 provider（例如 OpenAI API、Anthropic、OpenRouter 等）
- `~/.openclaw`、`~/.codex`、Gateway 地址、端口都不是默认值
- 一台机器上存在多套 OpenClaw home、多个可能的 Gateway，或者当前项目不是默认 workspace
- 机器上的活跃 agent 名单和本仓库示例完全不同
- 机器当前只能本地构建，暂时还接不上 live Gateway
- 机器缺少 `node` / `npm`、没有 npm registry 网络、或者仓库目录没有写权限
- 某些数据源缺失，但控制中心仍然应该先以“安全只读”方式跑起来

直接把下面整段原样交给 OpenClaw：

```text
你现在要帮我把 OpenClaw Control Center 安装并接到这台机器自己的 OpenClaw 环境上。

你的目标不是解释原理，而是直接完成一次安全的首次接入。

严格约束：
1. 只允许在 control-center 仓库里工作。
2. 除非我明确要求，否则不要修改应用源码。
3. 不要修改 OpenClaw 自己的配置文件。
4. 不要开启 live import，不要开启 approval mutation。
5. 所有高风险写操作保持关闭。
6. 不要假设这台机器使用默认 agent 名称、默认路径、默认订阅方式，必须以实际探测结果为准。
7. 不要把“缺少订阅数据 / 缺少 Codex 数据 / 缺少账单快照”当成安装失败；只要 UI 能安全跑起来，就应当继续并明确哪些面板会降级。
8. 不要伪造、生成、改写任何 provider API key、token、cookie 或外部凭证；如果 OpenClaw 本身缺少这些前置条件，只能报告，不要替用户猜。

请按这个顺序执行：

第一阶段：确认环境
1. 检查 OpenClaw Gateway 是否可达，并确认正确的 `GATEWAY_URL`。
2. 确认这台机器上正确的 `OPENCLAW_HOME` 和 `CODEX_HOME`。
3. 如果订阅或账单快照文件不在默认位置，找到正确的 `OPENCLAW_SUBSCRIPTION_SNAPSHOT_PATH`。
4. 确认这台机器上有哪些前提是真正存在的，哪些是缺失但允许降级的。
5. 如果机器上存在多个候选 `OPENCLAW_HOME`、多个可能的 Gateway，或多个 workspace，不要猜。
6. 如果缺少会导致“完全无法启动控制中心”的必要条件，直接停止并明确告诉我缺什么。
7. 如果缺少的只是增强型数据源，不要停止安装；继续并把这些项标记为“安装可继续，但相关页面会部分缺失”。
8. 不要假设任何固定 agent 名称。若 `openclaw.json` 可读，就以它为准。

第二阶段：安装项目
9. 确认当前目录是 control-center 仓库根目录。
10. 先确认仓库本体完整。
11. 如果缺少 `src/runtime`、`src/ui` 或 `package.json`，不要继续安装，直接重新 clone 官方仓库。
12. 运行依赖安装。
13. 如果 `.env` 不存在，就从 `.env.example` 创建；如果存在，就在保留安全默认值的前提下修正它。

第三阶段：配置安全首次接入
14. 保持这些值：
   - READONLY_MODE=true
   - LOCAL_TOKEN_AUTH_REQUIRED=true
   - APPROVAL_ACTIONS_ENABLED=false
   - APPROVAL_ACTIONS_DRY_RUN=true
   - IMPORT_MUTATION_ENABLED=false
   - IMPORT_MUTATION_DRY_RUN=false
   - UI_MODE=false
15. 只有在本机环境确实不同的时候，才修改：
   - GATEWAY_URL
   - OPENCLAW_HOME
   - CODEX_HOME
   - OPENCLAW_SUBSCRIPTION_SNAPSHOT_PATH
   - UI_PORT
16. 如果 `CODEX_HOME` 不存在，或者这台机器根本没有 Codex / GPT 订阅数据，不要强行填假路径；保留为空，并在结果里明确说明“Usage / Subscription 将部分可见或不可见”。

第四阶段：验证安装
17. 运行：
   - npm run build
   - npm test
   - npm run smoke:ui
18. 如果有任何一步失败，停止并告诉我：
   - 哪一步失败了
   - 原因是什么
   - 我下一步该怎么修
19. 如果 build / test / smoke 通过，但 live Gateway 仍不可达，也不要把这次接入判定为失败；要把结果归类为“本地 UI 已可用，但 live 观测尚未接通”。

第五阶段：交付可启动结果
20. 如果验证通过，输出：
   - 你实际修改了哪些 env 值
   - 最终 `.env` 中哪些值沿用了默认值
   - 我下一步启动 UI 的准确命令
   - 我应该先打开的 3 个页面
   - 哪些信号如果为空，属于“正常但未接线完全”
   - 哪些能力现在已经可用
   - 哪些能力因为当前机器没有相关数据源而处于降级状态
   - 如果我以后补上订阅 / Codex / Gateway，只需要补哪几个 env 或前置条件
```

## 最佳实践
- 如果这个控制中心主要给运营或观察用，第一轮上线尽量保持只读。
- 如果你准备联系 OpenClaw 官方或国际社区，仓库首页默认英文更合适，但中文入口应该保持一眼可见。
- richer usage / subscription / collaboration 这些面板是增强层，不该成为第一次启动的阻塞项。

## 对外展示与联系官方
- 明天可以直接复制的 X / Discord showcase 文案在 [docs/SHOWCASE.md](docs/SHOWCASE.md)。
- 如果你要联系 OpenClaw 官方，重点讲 operator value：观测、确定性、协作、用量、记忆、安全。

## 开源与发布卫生
- 仓库已经包含 `.gitignore`、`LICENSE` 和可发布的 package 元数据。
- `GATEWAY_URL` 可配置，不再绑定单一本地 socket。
- 公开文档统一使用通用 `~/.openclaw/...` 路径，不包含机器私有 home 目录。
- 每次公开推送前，建议先运行 `npm run release:audit`。
- 独立仓库发布流程见 [docs/PUBLISHING.md](docs/PUBLISHING.md)。
