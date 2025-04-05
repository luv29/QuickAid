from pydantic import BaseModel
from typing import Optional

class InputSchema(BaseModel):
    chat_id: str
    prompt: str
    serviceRequestId: Optional[str] = None
