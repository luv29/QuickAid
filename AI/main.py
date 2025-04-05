import json
from langchain_core.messages import HumanMessage, SystemMessage
from client import MCPClient
from agent import build_agent
from fastapi import FastAPI
from schemas.inputSchema import InputSchema
import uvicorn

app = FastAPI()

@app.post('/')
async def main(query: InputSchema):
    client = MCPClient()
    conn = None

    # inputs = {}
    # if query.serviceRequestId:
    #     input["serviceRequestId"] = query.serviceRequestId

    try:
        await client.connect_to_server("../backend/dist/index.js")
        agent, conn = await build_agent(client)

        config = {"configurable": {"thread_id": query.chat_id}}
        messages = [SystemMessage(content=f"Make use of this data as per requirements {query}", role="system"),
                     HumanMessage(content=query.prompt, role="user")]
        output = await agent.ainvoke({"messages": messages}, config)
        
        return json.loads(output['messages'][-1].content)

    except Exception as e:
        # print(f"Error: {e}")
        
        import traceback
        print("Error:", e)
        traceback.print_exc()
    finally:
        if conn:  
            await conn.close()
        await client.cleanup()

if __name__ == '__main__':
    uvicorn.run(app, host='localhost', port=8000)
