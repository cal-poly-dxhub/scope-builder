# import json
from typing import Any, Dict

import res


def python(event: Any, context: Any) -> Dict[str, Any]:
    return res.send_json(200, {"message": "python pong", "event": event})
