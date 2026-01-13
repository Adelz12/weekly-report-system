#!/bin/bash

# Script to install libvirt and Vagrant plugin for KVM support
# Run this script with: bash install-libvirt.sh

echo "Installing libvirt and required packages..."
sudo apt-get update
sudo apt-get install -y libvirt-daemon-system libvirt-clients qemu-kvm

echo ""
echo "Adding user to libvirt group..."
sudo usermod -aG libvirt $USER

echo ""
echo "Installing Vagrant libvirt plugin..."
vagrant plugin install vagrant-libvirt

echo ""
echo "=========================================="
echo "Installation completed!"
echo "=========================================="
echo ""
echo "IMPORTANT: You need to log out and log back in (or reboot) for the group membership to take effect."
echo ""
echo "After logging back in, run:"
echo "  cd vagrant"
echo "  vagrant up --provider=libvirt"
echo ""






































