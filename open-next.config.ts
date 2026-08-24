// My2KBuilder — OpenNext on Cloudflare Workers 配置（架构 v1 §2，planned → R8 implemented）
// MVP 无自定义 Worker 业务代码；仅 OpenNext 生成的服务入口。
// 不配置任何有状态 incremental cache binding（KV/R2 未启用，架构 v1 §3）。
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({});
