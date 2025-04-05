from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, RemoveMessage
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver
from langgraph.graph import StateGraph, START, END
from langgraph.graph import MessagesState
from client import MCPClient
import aiosqlite
import json

class State(MessagesState):
    summary: str

async def build_agent(client: MCPClient): 
    conn = await aiosqlite.connect("chats/test.db", check_same_thread = False)
    memory = AsyncSqliteSaver(conn)

    async def assistant(state: State):
        summary = state.get("summary", "")

        if summary:
            system_message = f"Summary of conversation earlier: {summary}"
            messages = [SystemMessage(content=system_message, role="system")] + state["messages"]
        else:
            messages = state["messages"]
        
        response = await client.process_query(messages)
        return {"messages": [AIMessage(content=response, role="assistant")]}

    async def summarize_conversation(state: State):
        summary = state.get("summary", "")

        if summary:
            summary_message = (
                f"This is summary of the conversation to date: {summary}\n\n"
                "Extend the summary by taking into account the new messages above:"
            )
        else:
            summary_message = "Create a summary of the conversation above:"

        messages = state["messages"] + [HumanMessage(content=summary_message, role="user")]         
        response = await client.process_query(messages)
        
        delete_messages = [RemoveMessage(id=m.id) for m in state["messages"][:-2]]
        return {"summary": json.loads(response)[0]['content']['text'], "messages": delete_messages}

    def should_continue(state: State):
        """Return the next node to execute."""
        
        messages = state["messages"]
        
        if len(messages) > 3:
            return "summarize_conversation"
        
        return END

    workflow = StateGraph(State)
    workflow.add_node("conversation", assistant)
    workflow.add_node(summarize_conversation)

    workflow.add_edge(START, "conversation")
    workflow.add_conditional_edges("conversation", should_continue)
    workflow.add_edge("summarize_conversation", END)

    agent = workflow.compile(checkpointer=memory)
    return agent, conn
