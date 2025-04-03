import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { MailService } from "./mail/mail.service";

// Create server instance
const server = new McpServer({
  name: "server",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

server.tool(
    "sos-emergency",
    "User uses it at the time of emergency. It takes the location of the user and send the email alerting the receipent about the user's situation along with it's location.",
    {
        to: z
            .string()
            .describe('Email of the reciever'),
        subject: z
            .string()
            .min(10, "Too Short Subject.")
            .max(100, "Too Long Subject.")
            .describe('The subject of the email. It should tell that the user is in emergency and describe his/her situation in short'),
        text: z
            .string()
            .min(20, "Content should be atleast 20 character long")
            .describe("This is the actual text that will be written in the email. This must contain all the relevant details about the emergency of the user."),
        html: z
            .string()
            .describe(`Generate an html page that will be shown in the email, it should represent the nature of urgency and also grab attention, and it should have a view location button, that will redirect the receiver to google maps to the location of the user, give dummy location if the location is not specified. The html you generate must be beautiful and attention grabbing`)
    },
    async ({to, subject, text, html}) => {
        const mail = new MailService();
        var x = await mail.sendMail({to, subject, text, html});
        return {
            content: [
                {
                    type: "text",
                    "text": JSON.stringify({
                        action: "mail sent successfully."
                    })
                }
            ]
        }
    }
)

// server.tool(
//     "userReviewAndRating",
//     "This tool allows users to rate and review the services provided by the mechanics and leave them a comment"
// )

  async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log("MCP Server running on stdio");
  }
  
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});