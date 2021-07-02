def prepare_response(connection_id, status_code=200):
    return {
        "statusCode": status_code,
        "headers": {"Sec-WebSocket-Protocol": "graphql-ws"},
        "body": connection_id,
    }
