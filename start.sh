#!/bin/bash
# TravelDiary - Start both backend and frontend servers

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🌍 TravelDiary - Starting servers..."
echo ""

# Start MongoDB if not running
if ! pgrep -x mongod > /dev/null 2>&1; then
    echo "📦 Starting MongoDB..."
    mkdir -p /tmp/mongodata
    mongod --dbpath /tmp/mongodata --fork --logpath /tmp/mongod.log 2>/dev/null || true
    sleep 2
fi

# Install backend dependencies if needed
if [ ! -d "$PROJECT_DIR/backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd "$PROJECT_DIR/backend" && npm install
fi

# Install frontend dependencies if needed
if [ ! -d "$PROJECT_DIR/frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd "$PROJECT_DIR/frontend" && npm install
fi

echo ""
echo "🚀 Starting backend server on http://localhost:5000 ..."
cd "$PROJECT_DIR/backend" && node server.js &
BACKEND_PID=$!
sleep 3

echo "🎨 Starting frontend dev server on http://localhost:5173 ..."
cd "$PROJECT_DIR/frontend" && npx vite --host &
FRONTEND_PID=$!
sleep 3

echo ""
echo "============================================"
echo "  ✅ TravelDiary is running!"
echo ""
echo "  Frontend:  http://localhost:5173"
echo "  Backend:   http://localhost:5000"
echo "  API Health: http://localhost:5000/api/health"
echo ""
echo "  Test Account:"
echo "    Email:    test@travel.com"
echo "    Password: Test1234"
echo ""
echo "  Press Ctrl+C to stop both servers and other sources hii my name is soumyadeep hello bose jan and how are you"
echo "============================================"

# Keep script alive and handle cleanup
trap "echo ''; echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Done.'; exit 0" SIGINT SIGTERM

wait


#hello boss how are you ?
