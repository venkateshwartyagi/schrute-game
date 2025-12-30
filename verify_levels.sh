#!/bin/bash
BASE_URL="http://localhost:3005/api/chat"
LOGS_URL="http://localhost:3005/api/logs"

echo "--- Generating Traffic ---"
curl -s -X POST $BASE_URL -H "Content-Type: application/json" -d '{"levelId": 1, "messages": [{"role": "user", "content": "hello"}]}' > /dev/null

echo "--- Checking Logs for IP ---"
curl -s $LOGS_URL | grep "127.0.0.1" || echo "IP Logging Failed"
