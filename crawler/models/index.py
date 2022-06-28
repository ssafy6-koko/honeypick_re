from pydantic import BaseModel
from typing import Optional

class Item(BaseModel):
    url: Optional[str] = None
    item_id: Optional[str] = None
