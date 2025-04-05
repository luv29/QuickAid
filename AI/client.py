import json
import os
from typing import Optional
from contextlib import AsyncExitStack
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

from dotenv import load_dotenv
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

from openai import OpenAI
from groq import Groq

load_dotenv()

class MCPClient:
    def __init__(self):
        self.session: Optional[ClientSession] = None
        self.exit_stack = AsyncExitStack()
        # self.llm = OpenAI()
        # self.model = "gpt-4o-mini"
        self.llm = Groq()
        self.model = "qwen-2.5-32b"

    async def connect_to_server(self, server_script_path: str):
        """Connect to an MCP server."""
        if not server_script_path.endswith(('.py', '.js')):
            raise ValueError("Server script must be a .py or .js file")

        command = "python" if server_script_path.endswith('.py') else "node"
        server_params = StdioServerParameters(
            command=command,
            args=[server_script_path],
            env={
                'SMTP_HOST': 'smtp.gmail.com',
                'SMTP_USER': os.getenv('SMTP_USER'),
                'SMTP_FROM': os.getenv('SMTP_FROM'),
                'SMTP_PASS': os.getenv('SMTP_PASS'),
                'SMTP_PORT': '587'
            }
        )

        stdio_transport = await self.exit_stack.enter_async_context(stdio_client(server_params))
        self.stdio, self.write = stdio_transport
        self.session = await self.exit_stack.enter_async_context(ClientSession(self.stdio, self.write))

        await self.session.initialize()
        response = await self.session.list_tools()
        print("\nConnected to server with tools:", [tool.name for tool in response.tools])

    async def process_query(self, messages: list) -> str:
        """Process a query using LLM and available tools."""

        response = await self.session.list_tools()
        available_tools = [
            {
                "type": "function",
                "function": {
                    "name": tool.name,
                    "description": tool.description,
                    "parameters": tool.inputSchema
                }
            }
            for tool in response.tools
        ]

        # Ensure messages are properly formatted for Groq
        formatted_messages = []
        for msg in messages:
            if isinstance(msg, HumanMessage):
                formatted_messages.append({"role": "user", "content": msg.content})
            elif isinstance(msg, AIMessage):
                formatted_messages.append({"role": "assistant", "content": msg.content})
            elif isinstance(msg, SystemMessage):
                formatted_messages.append({"role": "system", "content": msg.content})

        llm_response = self.llm.chat.completions.create(
            model=self.model,
            max_tokens=1000,
            messages=formatted_messages,  # Correctly formatted messages
            tools=available_tools
        )

        final_text = []
        if llm_response.choices[0].message.content:
            final_text.append({
                "from": "llm",
                "content": {
                    "text": str(llm_response.choices[0].message.content)
                }
            })

        for content in llm_response.choices[0].message.tool_calls or []:
            tool_name = content.function.name
            tool_args = json.loads(content.function.arguments)

            result = await self.session.call_tool(tool_name, tool_args)
            
            final_text.append({
                "from": tool_name,
                "content": json.loads(result.content[0].text)
            })

        return json.dumps(final_text)

    async def cleanup(self):
        """Clean up resources."""
        await self.exit_stack.aclose()