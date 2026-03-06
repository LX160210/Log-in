# 员工信息管理系统

这是一个完整的员工信息管理 Web 应用，包含前端界面和后端 REST API。  
支持员工注册、登录、密码找回、个人信息维护、修改密码、操作历史记录，以及管理员对员工账号的解锁和密码重置等功能。

---

## 功能特性

### 员工端

- **注册**：新员工使用工号（E + 数字）和密码注册
- **登录**：工号 + 密码登录，连续 5 次失败账号锁定 5 分钟
- **找回密码**：通过短信或邮箱验证码重置密码（演示环境直接显示验证码）
- **修改密码**：登录后可在个人中心修改密码
- **个人信息维护**：更新手机、邮箱、部门、岗位，并记录修改历史
- **安全退出**：清除本地会话

### 管理端

- **管理员登录**：默认账号 `admin / Admin123`（可通过环境变量覆盖）
- **管理员注册**：新管理员可自行注册（账号格式 A + 数字）
- **员工管理**：
  - 查看所有员工列表（工号、部门、岗位、登录状态、失败次数）
  - 解除员工账号锁定
  - 重置员工密码（需在界面输入新密码）

### 其他页面

首页、介绍页、关于页、联系页（联系页可提交留言，后端模拟处理）

---

## 技术栈

| 分层 | 技术 |
|------|------|
| 前端 | HTML5、CSS3、原生 JavaScript（无框架） |
| 后端 | Node.js + Express |
| 数据存储 | JSON 文件（`data/db.json`） |
| 运行环境 | Node.js (v14+) |

---

## 项目结构

```
project-root/
├── html/                   # 前端页面
│   ├── index.html          # 员工端首页
│   ├── admin.html          # 管理端
│   ├── intro.html          # 介绍页
│   ├── about.html          # 关于页
│   └── contact.html        # 联系页
├── css/
│   └── style.css           # 全局样式
├── js/
│   ├── employee.js         # 员工端逻辑
│   ├── admin.js            # 管理端逻辑
│   ├── contact.js          # 联系页逻辑
│   └── server.js           # 后端服务入口
├── data/
│   └── db.json             # 数据文件（员工、管理员）
├── package.json
├── package-lock.json
├── start-app.bat           # Windows 一键启动脚本
└── README.md               # 本文档
```

---

## 安装与运行

### 环境要求

- Node.js（v14 或更高版本）
- npm（通常随 Node.js 一起安装）

### 方式一：使用启动脚本（Windows）

双击项目根目录下的 `start-app.bat` 文件，脚本会自动：

1. 检查 npm 是否可用
2. 检查依赖，若 `node_modules` 不存在则自动运行 `npm install`
3. 检查端口 3000 是否已被占用
4. 若服务未运行，则新开命令行窗口启动服务
5. 自动打开浏览器访问 `http://localhost:3000/html/index.html`

> 如需局域网内其他设备访问，请使用本机的内网 IP，例如：`http://192.168.x.x:3000/html/index.html`

### 方式二：手动启动

在项目根目录下执行：

```bash
npm install      # 安装依赖
npm start        # 启动服务（或 npm run dev）
```

服务启动后，打开浏览器访问 `http://localhost:3000/html/index.html` 即可。

---

## 默认账号

### 员工账号

| 字段 | 值 |
|------|----|
| 工号 | `E1001` |
| 密码 | `Abc12345` |

### 管理员账号

| 字段 | 值 |
|------|----|
| 账号 | `admin` |
| 密码 | `Admin123` |

> 管理员密码可通过环境变量 `ADMIN_PASSWORD` 覆盖；  
> 账号 `admin` 不可被注册，但可以通过管理端注册其他管理员（格式 A + 数字）。

---

## API 接口概览

所有 API 路径均以 `/api` 开头，返回 JSON 格式。

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/login` | 员工登录 |
| POST | `/api/auth/register` | 员工注册 |
| POST | `/api/auth/send-code` | 发送找回密码验证码 |
| POST | `/api/auth/reset-password` | 重置密码 |
| POST | `/api/auth/change-password` | 修改密码（需登录状态） |
| GET  | `/api/employees/:id/profile` | 获取员工个人信息及历史 |
| PUT  | `/api/employees/:id/profile` | 更新员工个人信息 |
| POST | `/api/admin/login` | 管理员登录 |
| POST | `/api/admin/register` | 管理员注册 |
| GET  | `/api/admin/employees` | 获取所有员工列表（需管理员 token） |
| POST | `/api/admin/employees/:id/unlock` | 解除员工锁定 |
| POST | `/api/admin/employees/:id/reset-password` | 重置员工密码 |
| POST | `/api/contact` | 提交留言（模拟） |

> 管理员接口需要在请求头中携带 `Authorization: Bearer <token>`，token 由登录接口返回。

---

## 注意事项

- **密码规则**：所有密码必须同时包含字母和数字，且只能包含字母和数字，长度至少 8 位。
- **验证码演示**：在找回密码流程中，由于未集成真实短信/邮件网关，后端会直接返回验证码并在前端通过 `alert` 显示，方便测试。
- **数据持久化**：所有数据均保存在 `data/db.json` 文件中，重启服务数据不会丢失。
- **会话管理**：
  - 员工端使用 `localStorage` 存储工号作为登录凭证（简单模拟，实际生产应使用 token）。
  - 管理端使用内存 Map 存储会话 token，服务重启后所有管理员需重新登录。
- **端口占用**：默认使用 3000 端口，如需修改，请更改 `server.js` 中的 `PORT` 变量。

---

## 扩展与自定义

- **管理员默认密码**：可通过环境变量 `ADMIN_PASSWORD` 修改。
- **锁定阈值与时长**：可在 `server.js` 顶部调整 `LOCK_THRESHOLD` 和 `LOCK_DURATION_MS`。
- **验证码有效期**：修改 `CODE_EXPIRE_MS`。
- **前端样式**：所有样式集中在 `css/style.css`，可自由调整。

---

## 开发与贡献

本项目为教学/演示用途，欢迎 Fork 和修改。如有问题或建议，请在 GitHub 仓库提交 Issue。
