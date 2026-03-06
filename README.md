<div align="center">

# 🏢 员工登录与信息维护系统

**Employee Login & Profile Management System**

一个基于 **Node.js + Express** 的员工账号登录、密码管理与个人信息维护示例项目（前端使用原生 HTML/CSS/JavaScript，数据存储在本地 JSON 文件中）。

![Node.js](https://img.shields.io/badge/Node.js-v12%2B-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-学习交流-blue?style=flat-square)

</div>

---

## 📌 项目亮点

- 🔐 **登录安全策略**：连续输错 **5 次**自动锁定 **5 分钟**
- 📝 **注册规则校验**：工号 `E`+数字（如 `E1002`），密码 ≥ **6 位**
- 🔑 **找回密码（演示）**：验证码以弹窗展示（不真实发送短信/邮件）
- 👤 **个人信息维护**：手机号、邮箱、部门、岗位等信息可修改
- 📋 **变更历史记录**：默认展示最近 **50 条**信息变更
- 🚪 **安全退出**：清理本地会话/状态后返回登录页
- 🛡️ **管理员控制台**：管理员可查看员工列表、解锁被锁定账号、重置员工密码

> 适合作为：课程作业、Express 入门练习、简单账号体系 Demo。

---

## 🖼️ 页面预览

![项目首页预览](img/github首页.png)

---

## 📑 目录

- [项目简介](#-项目简介)
- [功能特性](#-功能特性)
- [技术栈](#-技术栈)
- [项目结构](#-项目结构)
- [安装与运行](#-安装与运行)
- [使用说明](#-使用说明)
- [演示账号](#-演示账号)
- [注意事项](#-注意事项)
- [自定义与扩展](#-自定义与扩展)
- [许可](#-许可)

---

## 📖 项目简介

前端采用原生 **HTML / CSS / JavaScript (ES6)**，后端使用 **Node.js + Express**，数据存储在本地 JSON 文件 `data/db.json` 中。

系统支持：员工注册、登录、找回密码（验证码演示）、修改密码、个人信息维护，并记录每一次信息修改的历史。

---

## ✨ 功能特性

| 功能 | 描述 |
|------|------|
| 🔐 **员工登录** | 工号 + 密码登录；连续输错 **5 次**后锁定 **5 分钟** |
| 📝 **员工注册** | 工号格式：`E` + 数字（如 `E1002`）；密码至少 **6 位** |
| 🔑 **找回密码** | 通过短信或邮箱发送验证码（演示环境弹窗显示），验证后可重置密码 |
| 🔒 **修改密码** | 登录后在个人中心修改密码 |
| 👤 **信息维护** | 修改手机号、邮箱、部门、岗位等信息；每次修改均被记录 |
| 📋 **历史记录** | 展示最近 **50 条**信息变更记录 |
| 🚪 **安全退出** | 清除本地会话，安全返回登录页 |
| 🛡️ **管理员登录** | 管理员账号登录管理台，会话有效期 **2 小时** |
| 👥 **员工管理** | 管理员可查看员工列表、解锁被锁定账号、重置员工密码 |

---

## 🛠 技术栈

| 分类 | 技术 |
|------|------|
| **前端** | HTML5, CSS3, JavaScript (ES6) |
| **后端** | Node.js, Express |
| **数据存储** | JSON 文件（`data/db.json`） |
| **状态管理** | localStorage 维持登录状态 |

---

## 📁 项目结构

```
项目根目录/
├── html/                        # 前端页面
│   ├── index.html               # 首页（登录 / 注册 / 个人中心）
│   ├── admin.html               # 管理员控制台（登录 / 员工管理）
│   ├── selfintroduction.html    # 个人介绍页
│   ├── about.html               # 关于我们
│   └── contact.html             # 联系页面
├── css/                         # 样式文件
│   ├���─ style.css                # 全局样式
│   └── sistyle.css              # 个人介绍页专用样式
├── js/                          # JavaScript 脚本
│   ├── employee.js              # 员工模块逻辑（登录 / 注册 / 个人中心）
│   ├── admin.js                 # 管理端页面逻辑（登录 / 员工管理）
│   ├── contact.js               # 联系页面留言处理
│   └── server.js                # Node.js 后端服务入口
├── data/                        # 数据存储
│   └── db.json                  # 员工数据（账号、密码、个人信息、历史）
├── img/                         # 图片资源
│   └── github首页.png           # 示例图片
├── package.json                 # npm 配置及依赖
├── package-lock.json            # 依赖版本锁定
└── start-app.bat                # Windows 一键启动脚本
```

---

## 🚀 安装与运行

### 环境要求

- **Node.js** v12 或更高版本

### ⚡ 快速启动（Windows）

双击 `start-app.bat`，脚本将自动：

1. 检查 npm 环境
2. 安装项目依赖
3. 启动后端服务
4. 自动打开 `http://localhost:3000`

### 🖥 手动启动

```bash
# 进入项目根目录
cd your-project-folder

# 安装依赖
npm install

# 启动服务
npm start
# 服务默认运行在 http://localhost:3000
```

### 🌐 局域网访问

服务默认监听 `0.0.0.0`，同一局域网内的设备可通过以下地址访问：

```
http://你的内网IP:3000
```

---

## 📘 使用说明

1. **登录**：使用演示账号或自行注册账号后登录。
2. **注册**：工号格式为 `E` + 数字（如 `E2002`），密码至少 6 位。
3. **找回密码**：点击“忘记密码”，输入工号并选择验证方式；点击“发送验证码”后会弹窗显示验证码，输入后即可重置密码。
4. **个人中心**：登录后可修改密码、更新个人信息；变更历史在页面下方表格展示。
5. **退出**：点击“安全退出”清除登录状态。
6. **管理员**：访问 `html/admin.html`，使用管理员账号登录后可查看员工列表、解锁被锁定账号、重置员工密码。还可在管理台注册新管理员（账号格式为 `A` + 数字，如 `A1001`；密码至少 **8 位**，且必须同时包含字母和数字）。

---

## 👤 演示账号

为避免 README 与数据文件不一致，演示账号请以 `data/db.json` 为准。当前仓库内置员工演示账号如下：

| 工号 | 密码 | 备注 |
|------|------|------|
| `E1001` | `Abc12345` | 内置员工账号 1（以 `data/db.json` 实际值为准） |
| `E1002` | `Abc12345` | 内置员工账号 2（以 `data/db.json` 实际值为准） |

管理员默认账号如下（可通过环境变量 `ADMIN_USERNAME` / `ADMIN_PASSWORD` 覆盖）：

| 账号 | 密码 | 备注 |
|------|------|------|
| `admin` | `Admin123` | 默认管理员账号 |

> 💡 该项目后端在处理请求时会读取 `data/db.json`；因此你手动修改账号/密码后，通常无需重启服务即可生效。

---

## ⚠️ 注意事项

- 验证码为**演示功能**：不会真实发送短信/邮件，而是通过 `alert` 弹出。
- 连续输错密码 **5 次**后锁定 **5 分钟**（重启服务会重置计数）。
- 所有数据保存在 `data/db.json` 中。

---

## 🔧 自定义与扩展

- 在 `server.js` 中可调整锁定策略：
  - `LOCK_THRESHOLD`：最大错误次数（默认 5）
  - `LOCK_DURATION_MS`：锁定时长（毫秒，默认 5 分钟）
- 通过环境变量可覆盖默认管理员账号：
  - `ADMIN_USERNAME`：管理员账号（默认 `admin`）
  - `ADMIN_PASSWORD`：管理员密码（默认 `Admin123`）
- 若需要接入真实数据库：替换 `loadDB` / `saveDB` 的实现逻辑即可（例如 MySQL / PostgreSQL / MongoDB）。

---

## 📄 许可

本项目仅供**学习交流**使用，无任何商业授权限制。