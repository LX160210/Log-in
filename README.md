# 员工信息管理系统

![Node.js](https://img.shields.io/badge/Node.js-v14%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

这是一个完整的员工信息管理 Web 应用，包含前端界面和后端 REST API。  
支持员工注册、登录、密码找回、个人信息维护、修改密码、操作历史记录，以及管理员对员工账号的解锁和密码重置等功能。

---

## 📑 目录

- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [默认账号](#默认账号)
- [API 接口概览](#api-接口概览)
- [注意事项](#注意事项)
- [扩展与自定义](#扩展与自定义)
- [开发与贡献](#开发与贡献)

---

## ✨ 功能特性

### 👤 员工端

| 功能 | 说明 |
|------|------|
| 注册 | 使用工号（E + 数字）和密码注册新账号 |
| 登录 | 工号 + 密码登录；连续 5 次失败将锁定账号 5 分钟 |
| 找回密码 | 通过验证码重置密码（演示环境直接显示验证码） |
| 修改密码 | 登录后在个人中心修改密码 |
| 个人信息维护 | 更新手机、邮箱、部门、岗位，并记录修改历史 |
| 安全退出 | 清除本地会话，退出登录状态 |

### 🛠️ 管理端

| 功能 | 说明 |
|------|------|
| 管理员登录 | 默认账号 `admin / Admin123`（可通过环境变量覆盖） |
| 管理员注册 | 新管理员可自行注册（账号格式：A + 数字） |
| 员工列表 | 查看所有员工的工号、部门、岗位、登录状态、失败次数 |
| 解除锁定 | 解除被锁定员工的账号 |
| 重置密码 | 在界面输入新密码后重置指定员工的密码 |

### 🌐 其他页面

首页、介绍页、关于页、联系页（联系页可提交留言，后端模拟处理）。

---

## 🧰 技术栈

| 分层 | 技术 |
|------|------|
| 前端 | HTML5、CSS3、原生 JavaScript（无框架） |
| 后端 | Node.js + Express |
| 数据存储 | JSON 文件（`data/db.json`） |
| 运行环境 | Node.js v14+ |

---

## 📁 项目结构

```
project-root/
├── html/                   # 前端页面
│   ├── index.html          # 员工端首页（登录、注册、密码找回）
│   ├── admin.html          # 管理端（员工管理）
│   ├── intro.html          # 介绍页
│   ├── about.html          # 关于页
│   └── contact.html        # 联系页（留言功能）
├── css/
│   └── style.css           # 全局样式
├── js/
│   ├── employee.js         # 员工端前端逻辑
│   ├── admin.js            # 管理端前端逻辑
│   ├── contact.js          # 联系页前端逻辑
│   └── server.js           # 后端服务入口（Express）
├── data/
│   └── db.json             # 数据文件（员工与管理员数据）
├── package.json
├── package-lock.json
├── start-app.bat           # Windows 一键启动脚本
└── README.md               # 本文档
```

---

## 🚀 快速开始

### 环境要求

- Node.js（v14 或更高版本）
- npm（通常随 Node.js 一起安装）

### 方式一：一键启动（Windows）

双击项目根目录下的 `start-app.bat`，脚本会自动：

1. 检查 npm 是否可用
2. 若 `node_modules` 不存在则自动执行 `npm install`
3. 检查端口 3000 是否已被占用
4. 新开命令行窗口启动服务
5. 自动打开浏览器访问首页

> 💡 局域网内其他设备可通过本机内网 IP 访问，例如：`http://192.168.x.x:3000/html/index.html`

### 方式二：手动启动

```bash
# 安装依赖
npm install

# 启动服务
npm start
# 或使用开发模式
npm run dev
```

服务启动后，打开浏览器访问：

```
http://localhost:3000/html/index.html
```

---

## 🔑 默认账号

### 员工账号（演示用）

| 字段 | 值 |
|------|----|
| 工号 | `E1001` |
| 密码 | `Abc12345` |

### 管理员账号

| 字段 | 值 |
|------|----|
| 账号 | `admin` |
| 密码 | `Admin123` |

> ⚠️ 管理员密码可通过环境变量 `ADMIN_PASSWORD` 覆盖；  
> 账号 `admin` 不可被注册，但可通过管理端注册其他管理员（格式：A + 数字，如 `A1001`）。

---

## 📡 API 接口概览

所有 API 路径均以 `/api` 开头，请求与响应均使用 JSON 格式。

#### 员工认证

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/login` | 员工登录 |
| POST | `/api/auth/register` | 员工注册 |
| POST | `/api/auth/send-code` | 发送找回密码验证码 |
| POST | `/api/auth/reset-password` | 通过验证码重置密码 |
| POST | `/api/auth/change-password` | 修改密码（需登录状态） |

#### 员工信息

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/employees/:id/profile` | 获取员工个人信息及操作历史 |
| PUT | `/api/employees/:id/profile` | 更新员工个人信息 |

#### 管理员

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/admin/login` | 管理员登录 |
| POST | `/api/admin/register` | 管理员注册 |
| GET  | `/api/admin/employees` | 获取所有员工列表（需 token） |
| POST | `/api/admin/employees/:id/unlock` | 解除员工锁定（需 token） |
| POST | `/api/admin/employees/:id/reset-password` | 重置员工密码（需 token） |

#### 留言

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/contact` | 提交留言（模拟处理） |

> 🔒 管理员接口需在请求头中携带 `Authorization: Bearer <token>`，token 由管理员登录接口返回。

---

## ⚠️ 注意事项

- **密码规则**：密码必须同时包含字母和数字，且只能包含字母和数字，长度至少 8 位。
- **验证码演示**：找回密码流程中，由于未集成真实短信/邮件网关，后端会直接返回验证码并在前端通过弹窗显示，方便测试。
- **数据持久化**：所有数据保存在 `data/db.json`，重启服务后数据不会丢失。
- **会话管理**：
  - 员工端使用 `localStorage` 存储工号作为登录凭证（演示用，生产环境应使用 token）。
  - 管理端使用内存 Map 存储会话 token，服务重启后管理员需重新登录。
- **端口配置**：默认使用 3000 端口，如需修改，请更改 `js/server.js` 中的 `PORT` 变量。

---

## 🔧 扩展与自定义

| 配置项 | 位置 | 说明 |
|--------|------|------|
| 管理员默认密码 | 环境变量 `ADMIN_PASSWORD` | 覆盖默认密码 `Admin123` |
| 登录失败锁定阈值 | `js/server.js` → `LOCK_THRESHOLD` | 默认连续失败 5 次触发锁定 |
| 账号锁定时长 | `js/server.js` → `LOCK_DURATION_MS` | 默认锁定 5 分钟（300000 ms） |
| 验证码有效期 | `js/server.js` → `CODE_EXPIRE_MS` | 默认 5 分钟 |
| 前端样式 | `css/style.css` | 全局样式，可自由调整 |

---

## 🤝 开发与贡献

本项目为教学/演示用途，欢迎 Fork 和修改。  
如有问题或建议，请在 [GitHub 仓库](https://github.com/LX160210/Log-in) 提交 Issue。
