import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import server from "./utils/mcpserver";
import "./mcptools/"

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log("MCP Server running on stdio");
}
  
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});