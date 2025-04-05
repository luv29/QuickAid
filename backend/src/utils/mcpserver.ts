import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Create server instance
const server = new McpServer({
    name: "server",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
    },
});

  export default server