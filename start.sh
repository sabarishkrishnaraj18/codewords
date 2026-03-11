#!/bin/bash
# Start both Codewords servers
echo "🎮 Starting Codewords..."
ROOT="$(cd "$(dirname "$0")" && pwd)"

# Start socket server in background
echo "Starting socket server on port 4000..."
cd "$ROOT/apps/socket-server"
node "$ROOT/node_modules/ts-node-dev/lib/bin.js" --respawn --transpile-only src/index.ts &
SOCKET_PID=$!

# Start Next.js dev server
echo "Starting Next.js on port 3000..."
cd "$ROOT/apps/web"
node "$ROOT/node_modules/next/dist/bin/next" dev &
NEXT_PID=$!

echo ""
echo "✅ Servers started!"
echo "   Next.js:       http://localhost:3000"
echo "   Socket server: http://localhost:4000"
echo ""
echo "Press Ctrl+C to stop all servers"

trap "kill $SOCKET_PID $NEXT_PID 2>/dev/null; echo 'Stopped.'" EXIT
wait
