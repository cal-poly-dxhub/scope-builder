import json
from typing import Any

from python import python


def handler(event: Any, context: Any) -> dict[Any, Any]:  # type: ignore
    path = event.get("path", "")

    try:
        if path == "/python":
            return python(event, context)

        return {
            "statusCode": 404,
            "body": json.dumps({"message": "path not found", "path": path}),
        }

    except Exception as e:
        print("Error:", str(e))
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "Internal server error", "error": str(e)}),
        }
