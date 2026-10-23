import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Every page is rendered per request or is static, so no incremental cache (and no R2 bucket) is needed.
export default defineCloudflareConfig();
