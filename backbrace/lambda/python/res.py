import json
from typing import Any


def send_error(status_code: int, message: str) -> dict[Any, Any]:
    return {
        "statusCode": status_code,
        "body": json.dumps({"message": message}),
    }


def send_status(status_code: int) -> dict[Any, Any]:
    return {
        "statusCode": status_code,
    }


def send_json(status_code: int, body: dict[Any, Any]) -> dict[Any, Any]:
    return {
        "statusCode": status_code,
        "body": json.dumps(body),
        "headers": {
            "Content-Type": "application/json",
        },
    }
