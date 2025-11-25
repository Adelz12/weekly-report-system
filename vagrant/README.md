# Vagrant Setup

This directory contains the Vagrant configuration for running the Weekly Report System on a local virtual machine (replacing EC2).

## Prerequisites

1. Install [Vagrant](https://developer.hashicorp.com/vagrant/install#linux)
2. Install [VirtualBox](https://www.virtualbox.org/wiki/Downloads) or another Vagrant provider

## Quick Start

1. Navigate to the vagrant directory:
   ```bash
   cd vagrant
   ```

2. Start the VM:
   ```bash
   vagrant up
   ```

3. SSH into the VM:
   ```bash
   vagrant ssh
   ```

4. Inside the VM, navigate to the project:
   ```bash
   cd /home/vagrant/weekly-report-system
   ```

5. Start the application with Docker Compose:
   ```bash
   docker compose up -d --build
   ```

## Access the Application

- Frontend: http://localhost:8888 (or http://192.168.56.10)
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

## SSH Access

### From Host Machine
```bash
vagrant ssh
```

### From External Network
```bash
ssh vagrant@192.168.56.10
# Password: vagrant
```

To use SSH keys instead of password:
1. Generate SSH key pair (if you don't have one):
   ```bash
   ssh-keygen -t rsa -b 4096
   ```

2. Copy public key to VM:
   ```bash
   ssh-copy-id vagrant@192.168.56.10
   ```

## VM Management

- **Start VM**: `vagrant up`
- **Stop VM**: `vagrant halt`
- **Restart VM**: `vagrant reload`
- **Destroy VM**: `vagrant destroy`
- **Check Status**: `vagrant status`
- **SSH into VM**: `vagrant ssh`

## Port Forwarding

The following ports are forwarded from the VM to your host machine:
- 80 → 8888 (Frontend/Nginx)
- 5000 → 5000 (Backend API)
- 3000 → 3000 (Frontend dev server)
- 27017 → 27017 (MongoDB)

## Troubleshooting

If you encounter issues:

1. **VM won't start**: Check VirtualBox is installed and running
2. **Port conflicts**: Change port forwarding in Vagrantfile if ports are already in use
3. **SSH connection issues**: Try `vagrant reload` to restart the VM
4. **Permission issues**: Ensure your user is in the docker group inside the VM

