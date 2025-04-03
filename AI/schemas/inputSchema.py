from pydantic import BaseModel

class InputSchema(BaseModel):
    chat_id: str
    prompt: str