# 云端家书 ✉️

> 把你的牵挂，变成孩子能感受到的温暖

一个帮助留守儿童父母表达爱意的 Next.js 全栈应用。通过 AI 技术，将父母简短的话语转化为温暖、真诚、有画面感的家书。

## 🌟 项目背景

### 父母端的困境
- 工作忙碌，只能在下班后短暂联系
- 不善言辞，电话里除了"吃了吗""听话""好好学习"就没话说了
- 想表达关心，但说出来的话总是变成唠叨或指责
- 错过孩子的日常，不知道孩子最近在经历什么

### 孩子端的困境
- 觉得父母不理解自己，不想说
- 想分享的事情很多，但父母总是很忙
- 渴望被看见、被认可，而不只是被问成绩
- 久而久之，习惯了报喜不报忧，甚至什么都不报

## ✨ 功能特点

- **AI 家书生成**：将父母简单的话语转化为温暖的家书
- **多种角色选择**：支持爸爸、妈妈、爷爷、奶奶、外公、外婆等身份
- **个性化称呼**：可自定义孩子的称呼
- **示例提示**：提供常用话语示例，方便快速开始
- **一键复制**：生成的家书可一键复制，方便分享
- **响应式设计**：支持手机、平板、电脑等各种设备

## 🚀 快速开始

### 前置要求

- Node.js 18+
- npm 或 yarn 或 pnpm
- 火山方舟 API 密钥（访问 [火山方舟控制台](https://console.volcengine.com/ark) 获取）

### 本地开发

1. **克隆项目**

```bash
git clone <your-repo-url>
cd cloud-letter-nextjs
```

2. **安装依赖**

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

3. **配置环境变量**

复制 `.env.example` 到 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的火山方舟 API 配置：

```env
VOLCANO_API_KEY=your_volcano_api_key_here
VOLCANO_API_URL=https://ark.cn-beijing.volces.com/api/v3
VOLCANO_MODEL=ep-20241208123456-abcde
```

**如何获取火山方舟 API 配置：**
- 访问 [火山方舟控制台](https://console.volcengine.com/ark)
- 创建 API 密钥，获取 `VOLCANO_API_KEY`
- 创建模型服务端点，获取 `VOLCANO_MODEL`（格式如：`ep-20241208123456-abcde`）
- `VOLCANO_API_URL` 根据你的地域选择：
  - 北京：`https://ark.cn-beijing.volces.com/api/v3`
  - 上海：`https://ark.cn-shanghai.volces.com/api/v3`
  - 其他地域请参考火山方舟文档

4. **启动开发服务器**

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

5. **访问应用**

打开浏览器访问：http://localhost:3000

## 📁 项目结构

```
cloud-letter-nextjs/
├── app/                        # Next.js App Router
│   ├── api/                    # API Routes
│   │   └── generate-letter/    # 家书生成 API
│   │       └── route.ts
│   ├── globals.css             # 全局样式
│   ├── layout.tsx              # 根布局
│   └── page.tsx                # 主页面
├── lib/                        # 工具库
│   └── volcano.ts              # 火山方舟 API 集成
├── .env.example                # 环境变量示例
├── .gitignore                  # Git 忽略文件
├── next.config.ts              # Next.js 配置
├── package.json                # 项目依赖
├── postcss.config.mjs          # PostCSS 配置
├── tailwind.config.ts          # Tailwind CSS 配置
├── tsconfig.json               # TypeScript 配置
└── README.md                   # 项目文档
```

## 🚢 部署到 Vercel

### 1. 推送代码到 GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. 部署到 Vercel

1. 访问 [Vercel](https://vercel.com)
2. 使用 GitHub 登录
3. 点击 "New Project"
4. 导入你的 GitHub 仓库
5. Vercel 会自动检测到 Next.js 项目
6. 配置环境变量：
   - `VOLCANO_API_KEY`：你的火山方舟 API 密钥
   - `VOLCANO_API_URL`：火山方舟 API 地址
   - `VOLCANO_MODEL`：你的模型端点 ID
7. 点击 "Deploy"

### 3. 部署完成

部署完成后，Vercel 会提供一个公网 URL，你可以通过这个 URL 访问你的应用。

## 🛠️ 技术栈

- **框架**：Next.js 15 (App Router)
- **语言**：TypeScript
- **样式**：Tailwind CSS
- **AI 服务**：火山方舟大模型 API
- **HTTP 客户端**：Axios
- **部署**：Vercel

## 📝 使用示例

1. 在输入框中输入你想对孩子说的话，例如："让他好好学习，别老玩手机"
2. 选择你的身份（爸爸/妈妈/爷爷等）
3. 输入孩子的称呼（如：宝贝、小明）
4. 点击"生成家书"按钮
5. 查看生成的家书，可以复制或重新生成

## 🔒 安全提示

- ⚠️ **不要将 `.env` 文件提交到 Git 仓库**
- ⚠️ **妥善保管你的 API 密钥**
- ⚠️ **生产环境使用 HTTPS**

## 🔧 故障排除

### 问题：生成家书失败，返回 500 错误

**可能原因和解决方案：**

1. **API 配置错误**
   - 检查 `.env` 文件中的 `VOLCANO_API_KEY` 和 `VOLCANO_MODEL` 是否正确
   - 确认 API 密钥有效且未过期

2. **API 端点 URL 错误**
   - 确认 `VOLCANO_API_URL` 是否正确
   - 根据你的地域选择正确的 URL

3. **模型端点格式错误**
   - `VOLCANO_MODEL` 应该是完整的端点 ID，格式如：`ep-20241208123456-abcde`
   - 在火山方舟控制台创建模型服务端点后获取

4. **查看详细错误日志**
   - 在 Vercel 部署后，访问 Vercel Dashboard 查看 Function Logs
   - 本地开发时查看终端输出的详细错误信息

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 💝 致谢

感谢所有为留守儿童心理健康付出努力的人们。

---

**用 AI 的力量，让爱更好地传达 💕**
