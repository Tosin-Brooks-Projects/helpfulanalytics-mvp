#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

echo "Checking environment..."
echo "Node path: $(which node)"
echo "Node version: $(node -v)"
echo "PNPM path: $(which pnpm)"
echo "PNPM version: $(pnpm -v)"

echo "Installing dependencies..."
pnpm install
