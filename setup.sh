#!/bin/bash
set -e
cd /Users/benjaminm/Projekte/GRND

# Init vite react project
npm create vite@latest . -- --template react <<< "y"

# Install deps
npm install
npm install zustand recharts tailwindcss @tailwindcss/vite

# Create directory structure
mkdir -p src/engine src/classes src/events src/ui/components src/export

echo "DONE"
