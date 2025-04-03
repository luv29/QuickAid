import asyncio
from typing import Optional
from contextlib import AsyncExitStack
import json
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

from openai import OpenAI
from groq import Groq
from dotenv import load_dotenv

load_dotenv()  # load environment variables from .env

deepseek_api_key = "sk-c6171c4ba22241529816c2fd970b9f22"

class MCPClient:
    def __init__(self):
        # Initialize session and client objects
        self.session: Optional[ClientSession] = None
        self.exit_stack = AsyncExitStack()
        self.anthropic = OpenAI()
        self.model = "gpt-4o-mini"

    
    async def connect_to_server(self, server_script_path: str):
        """Connect to an MCP server

        Args:
            server_script_path: Path to the server script (.py or .js)
        """
        is_python = server_script_path.endswith('.py')
        is_js = server_script_path.endswith('.js')
        if not (is_python or is_js):
            raise ValueError("Server script must be a .py or .js file")

        command = "python" if is_python else "node"
        server_params = StdioServerParameters(
            command=command,
            args=[server_script_path],
            env= {
            'SMTP_HOST':'smtp.gmail.com',
            'SMTP_USER':'gopalsavaliya245@gmail.com',
            'SMTP_FROM':'gopalsavaliya245@gmail.com',
            'SMTP_PASS':'cpwg arsax zxo ivbd',
            'SMTP_PORT':'587'
            }
        )

        stdio_transport = await self.exit_stack.enter_async_context(stdio_client(server_params))
        self.stdio, self.write = stdio_transport
        self.session = await self.exit_stack.enter_async_context(ClientSession(self.stdio, self.write))

        await self.session.initialize()

        # List available tools
        response = await self.session.list_tools()
        self.tools = response.tools
        tools = self.tools
        # print(tools)
        print(self.session)
        print("\nConnected to server with tools:", [tool.name for tool in tools])
    
    async def process_query(self, query: str) -> str:
        """Process a query using Claude and available tools"""
        messages = [
            {
                "role": "system",
                "content": "you are a helpful assistant, you have certein tools to help you assist the user better, if you don't have all the arguments of the tool, then request it from the user, never pass arguments by your own. If it is an emergency pass arguments on your own as the user may be harmed if you ask the user"
            },
            {
                "role": "user",
                "content": query
            }
        ]

        print(self.session)

        # response = await self.session.list_tools()
        # print(response)
        available_tools = [{
            "type": "function",
            "function": {
                "name": tool.name,
                "description": tool.description,
                "parameters": tool.inputSchema
            }
        } for tool in self.tools]

        # Initial Claude API call
        response = self.anthropic.chat.completions.create(
            model=self.model,
            max_tokens=1000,
            messages=messages,
            tools=available_tools
        )

        # Process response and handle tool calls
        final_text = []
        if response.choices[0].message.content:
            final_text.append(str(response.choices[0].message.content))

        assistant_message_content = []
        for content in response.choices[0].message.tool_calls or []:
            tool_name = content.function.name
            tool_args = json.loads(content.function.arguments)

            # Execute tool call
            result = await self.session.call_tool(tool_name, tool_args)
            final_text.append(f"[Calling tool {tool_name} with args {tool_args}]")

            # print("Let's check:", result.content[])
            final_text.append(result.content[0].text)

            assistant_message_content.append((content))
            messages.append({
                "role": "assistant",
                "content": f"[Calling tool {tool_name} with args {tool_args}]"
            })
            messages.append({
                "role": "user",
                "content": result.content
            })
            # messages.append({
            #     "role": "user",
            #     "content": [
            #         {
            #             "type": "tool_result",
            #             "tool_use_id": content.id,
            #             "content": str(aresult.content)
            #         }
            #     ]
            # })

            # print(messages)

            # Get next response from Claude
            # response = self.anthropic.chat.completions.create(
            #     model=self.model,
            #     max_tokens=1000,
            #     messages=messages,
            #     tools=available_tools
            # )

            # if response.choices[0].message.content:
            #     final_text.append(str(response.choices[0].message.content))

        return "\n".join(final_text)

    async def chat_loop(self):
        """Run an interactive chat loop"""
        print("\nMCP Client Started!")
        print("Type your queries or 'quit' to exit.")

        while True:
            try:
                query = input("\nQuery: ").strip()

                if query.lower() == 'quit':
                    break

                response = await self.process_query(query)
                print("\nres: " + response)

            except Exception as e:
                print(f"\nError: {str(e)}")

    async def cleanup(self):
        """Clean up resources"""
        await self.exit_stack.aclose()

async def main():
    if len(sys.argv) < 2:
        print("Usage: python client.py <path_to_server_script>")
        sys.exit(1)

    client = MCPClient()
    try:
        await client.connect_to_server(sys.argv[1])
        await client.chat_loop()
    except Exception as e:
        print(e)
    finally:
        await client.cleanup()

if __name__ == "__main__":
    import sys
    asyncio.run(main())
