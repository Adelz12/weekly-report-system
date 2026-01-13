#!/bin/bash

# Script to set up SSH access for Vagrant VM
# This allows external SSH access to the Vagrant VM

echo "Setting up SSH access for Vagrant VM..."

# Check if VM is running
if ! vagrant status | grep -q "running"; then
    echo "Starting Vagrant VM..."
    vagrant up
fi

# Get VM IP address
VM_IP=$(vagrant ssh-config | grep HostName | awk '{print $2}')

if [ -z "$VM_IP" ]; then
    # Try to get IP from private network
    VM_IP="192.168.56.10"
fi

echo "VM IP: $VM_IP"

# Generate SSH key if it doesn't exist
if [ ! -f ~/.ssh/id_rsa.pub ]; then
    echo "Generating SSH key..."
    ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
fi

# Copy SSH key to VM
echo "Copying SSH key to VM..."
ssh-copy-id -i ~/.ssh/id_rsa.pub vagrant@$VM_IP 2>/dev/null || {
    echo "Attempting to copy key manually..."
    cat ~/.ssh/id_rsa.pub | vagrant ssh -c "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
}

echo ""
echo "SSH setup completed!"
echo ""
echo "You can now SSH into the VM using:"
echo "  ssh vagrant@$VM_IP"
echo ""
echo "Or from the vagrant directory:"
echo "  vagrant ssh"
echo ""
echo "For GitHub Actions, add the following secrets:"
echo "  VAGRANT_VM_HOST: $VM_IP"
echo "  VAGRANT_VM_USER: vagrant"
echo "  VAGRANT_VM_SSH_KEY: (contents of ~/.ssh/id_rsa)"
echo "  VAGRANT_VM_PORT: 22"






































