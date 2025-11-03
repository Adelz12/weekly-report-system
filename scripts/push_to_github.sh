#!/usr/bin/env bash
set -e

# Helper to initialize git, create a GitHub repo (if gh CLI is available), and push.
# Usage:
# 1) Make executable: chmod +x scripts/push_to_github.sh
# 2) Run: ./scripts/push_to_github.sh

REPO_NAME=$(basename "$(pwd)")

echo "Preparing to upload repository: $REPO_NAME"

if ! command -v git >/dev/null 2>&1; then
  echo "git is not installed. Please install git and try again." >&2
  exit 1
fi

if [ ! -d .git ]; then
  echo "Initializing git repository..."
  git init
  git add .
  git commit -m "Initial commit"
else
  echo "Git repository already initialized. Adding and committing any changes..."
  git add .
  git commit -m "Update" || true
fi

if command -v gh >/dev/null 2>&1; then
  echo "gh CLI detected. Creating remote repository using gh..."
  # Try to create public repo; fallback to interactive mode if name exists
  gh repo create "$REPO_NAME" --public --source=. --remote=origin --push || {
    echo "gh repo create failed (maybe repo exists). Please provide a remote URL or create the repo manually.";
  }
  echo "Done (if gh succeeded)."
  exit 0
fi

echo "gh CLI not found. Please create an empty repository on GitHub (https://github.com/new) and provide its remote URL."
read -p "Remote URL (e.g. git@github.com:username/$REPO_NAME.git or https://github.com/username/$REPO_NAME.git): " REMOTE

if [ -z "$REMOTE" ]; then
  echo "No remote provided. Exiting." >&2
  exit 1
fi

git remote add origin "$REMOTE" || git remote set-url origin "$REMOTE"
git branch -M main || true
git push -u origin main

echo "Pushed to $REMOTE. Visit https://github.com/$(echo $REMOTE | sed -E 's#.*/(.*)\.git#\1#')"
