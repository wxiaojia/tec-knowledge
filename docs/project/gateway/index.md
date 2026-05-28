## rag-api-gateway 网关系统

### 总览

这个项目本质上是一个 Node.js + Express + TypeScript 的“聚合网关”，不是单纯的转发层。它把前端统一入口收敛到一个服务里，然后做 4 件事：

- 反向代理到各个后端微服务。
- 对 GraphQL 结果做二次过滤、排序、分页。
- 给 Ceph/S3 生成上传和预览预签名地址。
- 把 Redis/Kafka 的消息桥接成 WebSocket/STOMP 推给前端。

主入口在 src/app.ts (line 30) 和 src/config/index.ts (line 21)。app.ts 负责挂中间件、Swagger、路由和 WebSocket 初始化；config/index.ts 负责加载 .env.*，并定义所有下游服务地址、前缀和 Redis/Kafka/WebSocket 配置。

### 前后端怎么交互

前端和它的交互主要有 5 条链路：
- 普通 REST 微服务调用：前端请求 /gateway/{service-name}/v1/...，由 src/routes/proxy.router.ts (line 35) 解析服务名，再由 src/controllers/proxy.controller.ts (line 68) 用 http-proxy 转发到 .env 里配置的目标服务。

- 兼容旧路径的代理：前端如果走 /gateway/pgsteel-gendo/api/v1/...，网关会按 URL 内容把它改写到 detection-process 或 algo-access，这是历史兼容逻辑，在 src/routes/proxy.router.ts (line 15)。

- GraphQL：前端请求 /graphql，网关转发到 GRAPHQL_GATEWAY；/graphql/filter、/graphql/filter/page、几个 task/page 接口会先拿 GraphQL 结果，再在网关内做过滤/排序/分页，逻辑在 src/controllers/graphql.controller.ts (line 163)。

- 文件上传：前端先调 /gateway/ceph/file/getUploadUrl 或分片相关接口，网关返回 Ceph 的预签名上传 URL；然后前端直接把文件 PUT 到对象存储，不再经过网关大文件中转，逻辑在 src/controllers/ceph.controller.ts (line 362)。

- 实时消息：前端连 ws://host:11000/ws/stomp，订阅 /notify/...、/logs/... 等 topic；网关再去订阅 Redis/Kafka，把消息转成 STOMP 推回前端，逻辑在 src/controllers/websocket.proxy.ts (line 52)、src/services/kafka.ts (line 81)、src/services/redis.ts (line 10)。

### 这个系统具体做了什么

它对外暴露的能力基本是这些：微服务统一入口：把 ml-ops、algo-access、data-management、detection-process、label-management、faas-ms-biz、kb-chat 等多个后端藏在网关后面。

GraphQL 结果整形：不是只透传，还会删空字段、任务列表筛选、内存分页。

Ceph 文件能力：普通上传签名、下载签名、分片上传、列分片、完成/中止上传、临时上传 URL。

运维监控能力：对 Prometheus 做复杂 PromQL 聚合，产出主机/GPU/AI 资源/运行时长等接口。

WebSocket 消息总线：把 Redis 的通知消息和 Kafka 的日志/训练/告警消息推给前端。

### 文件作用
package.json：项目元信息、依赖、构建和启动脚本。

index.js：生产入口，直接加载 dist/server。

bin/gateway：CLI 启动入口。

Dockerfile：容器化部署，基于 pm2 镜像启动。

start.sh：容器启动脚本，从 /root/.s3cfg 读取 Ceph 配置后启动 pm2-runtime。

pm2.json：生产进程配置。

nodemon.json：开发态热更新配置，直接跑 ts-node src/server.ts。

tsconfig.json：TS 编译配置和 @/* 路径别名。

Jenkinsfile：CI/CD，包含构建、发版、部署到 K8s。

.env.development、.env.production、.env.230：不同环境的下游服务地址和中间件配置。

helm/*：Kubernetes Helm 部署模板。

public/*：只有 favicon 和样式，基本不是核心。

README.md：几乎没内容。

src/server.ts：实例化 App 并监听端口。

src/app.ts (line 30)：系统装配中心，挂中间件、Swagger、路由、错误处理、WebSocket 初始化。

src/config/index.ts (line 5)：读取环境变量，定义微服务映射 msUrl、前缀 /gateway 和 /graphql、WebSocket/Redis/Kafka 配置。

src/routes/index.router.ts：根路径 /，返回 hello 和当前服务映射。

src/routes/proxy.router.ts (line 15)：通用 REST/WS 代理路由。

src/routes/graphql.router.ts：GraphQL 代理和二次加工接口。

src/routes/ceph.router.ts：Ceph/S3 相关接口路由。

src/routes/prometheus.router.ts：Prometheus 聚合查询接口路由。

src/routes/websocket.router.ts：HTTP 方式触发 websocket 推送。

src/routes/opa.router.ts：策略引擎 OPA 访问入口。

src/controllers/proxy.controller.ts (line 6)：http-proxy 封装，修正 POST body 转发，支持 websocket upgrade。

src/controllers/graphql.controller.ts (line 145)：GraphQL 透传、结果包装、空字段清理、分页、排序、任务列表筛选。

src/controllers/ceph.controller.ts (line 43)：Ceph 预签名、分片上传和临时上传地址。

src/controllers/prometheus.controller.ts (line 27)：Prometheus 多指标聚合、实例过滤、分页、资源监控。

src/controllers/opa.controller.ts：转发到 policy-engine，用于策略校验。

src/controllers/websocket.proxy.ts (line 16)：STOMP 服务端，接 Redis/Kafka 后推送给订阅客户端。

src/api/prometheus.ts：Prometheus HTTP 调用封装。

src/api/user-authority.ts：用户权限服务调用封装，包含 token 校验和临时登录。

src/services/s3.services.ts：初始化 AWS SDK v2/v3 客户端，对接 Ceph。

src/services/redis.ts：Redis 订阅/退订，把消息转成内部事件。

src/services/kafka.ts：Kafka consumer 管理，按 topic 分类消费日志、告警、视频渲染结果。

src/middlewares/timeout.middlewares.ts：默认 3 分钟超时，也支持请求头 x-timeout 覆盖。

src/middlewares/auth.middlewares.ts：鉴权中间件，校验 x-token、x-account 并请求 user-authority。

src/middlewares/temp.middlewares.ts：没有 token 时自动用临时账号登录拿 token。

src/utils/http.ts (line 6)：统一 Axios 封装。

src/utils/result.ts：统一返回结构 {status,msg,data}。

src/utils/logger.ts：日志等级包装。

src/utils/index.ts：to()、时间格式化、header 处理等通用函数。

src/utils/ceph.ts：bucket 存在性检查、自动建桶、设置 CORS、替换 Ceph host。

src/utils/events.ts：内部事件总线 EventEmitter。

src/utils/cache/count-cache.ts：记录 topic 被多少 websocket session 订阅。

src/utils/swagger/index.ts：挂载 /swagger 和 /swagger.json。

src/interfaces/request.interface.ts：通用返回体和基础对象接口。

src/models/authority.model.ts：权限和登录 DTO。

src/models/page.model.ts：分页 DTO。

src/models/base.model.ts：基础模型。

src/enums/api.enum.ts：微服务名枚举。

src/enums/log.enum.ts：日志等级枚举。

src/exceptions/HttpException.ts：简单 HTTP 异常类。

src/views/index.ejs、src/views/error.ejs：遗留模板文件，当前基本没接入。

src/api/prometheus.ts 和部分中文注释存在编码乱码，但不影响运行逻辑。

### 几个关键判断
这是“微服务网关 + 文件签名服务 + 监控聚合服务 + 实时消息桥接服务”的组合体。

鉴权代码虽然存在，但在 src/app.ts (line 96) 里实际上被注释掉了，当前仓库代码默认并没有启用 authMiddleware 和 tempMiddleware。

根路径 / 不是前端页面，只是一个简单说明接口；真正前端应该是外部系统，通过这个网关来访问后端能力。

WebSocket 不是复用 HTTP 4000 端口，而是独立跑在 WEB_SOCKET_PORT，默认 11000。