#!/bin/bash
# Setup script to install Git hooks

echo "🔧 Setting up Git hooks..."

# Configure Git to use .githooks directory
git config core.hooksPath .githooks

# Make hooks executable
chmod +x .githooks/pre-push
chmod +x .githooks/commit-msg

echo "✅ Git hooks installed successfully!"
echo ""
echo "Configured hooks:"
echo "  - pre-push: Prevents direct pushes to main branch"
echo "  - commit-msg: Enforces conventional commit format"
echo ""
echo "To bypass hooks (not recommended):"
echo "  git push --no-verify"
echo "  git commit --no-verify"
