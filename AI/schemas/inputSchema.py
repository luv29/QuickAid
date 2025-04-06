from pydantic import BaseModel
from typing import Optional

class InputSchema(BaseModel):
    chat_id: str
    prompt: str
    serviceRequestId: Optional[str] = None
    userId: Optional[str] = None
    mechanicId: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
