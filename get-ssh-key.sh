#!/bin/bash

# Script to get SSH private key for GitHub Secrets

echo "=========================================="
echo "SSH Private Key for GitHub Secrets"
echo "=========================================="
echo ""

# Check if SSH key exists
if [ ! -f ~/.ssh/id_rsa ]; then
    echo "SSH key not found. Generating new SSH key..."
    echo ""
    ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
    echo ""
fi

echo "Copy the following content and paste it in GitHub Secret 'VAGRANT_VM_SSH_KEY':"
echo ""
echo "----------------------------------------"
cat ~/.ssh/id_rsa
echo "----------------------------------------"
echo ""
echo "IMPORTANT: Keep this key secure and never share it publicly!"
echo ""































