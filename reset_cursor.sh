#!/bin/bash
echo "This script will reset Cursor's workspace state"
echo "Make sure Cursor is CLOSED before running this!"
echo ""
read -p "Have you closed Cursor? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Resetting Cursor workspace state..."
    rm -rf ~/.config/Cursor/User/workspaceStorage/*
    rm -rf ~/.config/Cursor/User/History/*
    echo "Done! Now restart Cursor."
else
    echo "Please close Cursor first, then run this script again."
fi
