# 任务绩效管理系统

基于 PHP + MySQL 的任务管理系统，每个任务都和绩效挂钩。

## 技术栈

- **前端**: React + Vite + TypeScript + TailwindCSS v3 + RadixUI
- **后端**: PHP 8.2 + Nginx
- **数据库**: MySQL 8.0
- **部署**: Docker Compose

## PRD - 技术架构（Architecture）

- **整体分层**: 前端（React） ⇄ 后端 API（PHP） ⇄ 数据库（MySQL）
- **后端架构（MVC）**
  - **入口/路由层**: `backend/public/index.php` 作为统一 API 入口，负责路由分发与中间件鉴权
  - **Controller 层**: `backend/src/Controllers/` 处理 HTTP 请求、参数校验与响应格式
  - **Model 层（ORM）**: `backend/src/Models/` 使用 **Eloquent ORM** 管理数据与关系（**禁止**在业务代码中拼接/书写原始 SQL）
  - **ORM 启动（Boot）**: `backend/src/Models/Eloquent/Eloquent.php`
- **数据初始化**: `database/init.sql` 仅用于容器启动时初始化表结构与默认数据（运行时数据读写全部通过 ORM 完成）

## How to Run

```bash
docker compose up --build
```

## Services

| 服务 | 地址 | 描述 |
|------|------|------|
| Frontend | <http://localhost:3000> | 前端应用 |
| Backend | <http://localhost:8080> | 后端 API |
| Database | localhost:3306 | MySQL 数据库 |

## 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | root123 |
| 测试用户 | testuser | 123456 |

## Verification

### 基本验证方式

1. 执行 `docker compose up` 启动所有服务
2. 访问 <http://localhost:3000> 打开前端页面
3. 使用默认管理员账号 `admin / root123` 登录
4. 创建任务、分配绩效权重
5. 更新任务状态为已完成
6. 对完成的任务进行评分
7. 查看绩效统计仪表盘

### API 健康检查

```bash
curl http://localhost:8080/api/health
```

## 功能特性

### 用户管理

- ✅ 用户注册/登录
- ✅ 管理员/普通用户角色区分
- ✅ JWT 身份认证

### 任务管理

- ✅ 任务 CRUD
- ✅ 任务状态流转 (待办 → 进行中 → 已完成 → 已评分)
- ✅ 优先级设置
- ✅ 绩效权重配置

### 绩效管理

- ✅ 管理员评分 (1-5 星)
- ✅ 绩效公式: `月度绩效 = Σ(任务评分 × 绩效权重) / Σ绩效权重`
- ✅ 绩效排行榜
- ✅ 月度趋势图

## 项目结构

```
├── frontend/          # React 前端
│   ├── src/
│   │   ├── api/       # API 调用
│   │   ├── components/# React 组件
│   │   ├── hooks/     # 自定义 Hooks
│   │   ├── pages/     # 页面组件
│   │   └── types/     # TypeScript 类型
│   ├── Dockerfile
│   └── nginx.conf
│
├── backend/           # PHP 后端
│   ├── public/        # 入口文件
│   ├── src/
│   │   ├── Controllers/
│   │   ├── Middleware/
│   │   ├── Models/     # Eloquent Models（ORM）
│   │   └── Utils/
│   ├── Dockerfile
│   └── nginx.conf
│
├── database/          # 数据库脚本
│   └── init.sql
│
└── docker-compose.yml
```

## License

MIT
