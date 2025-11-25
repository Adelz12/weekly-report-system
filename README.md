# Weekly Report System

A full-stack web application for managing weekly reports in a company environment.

## Tech Stack

- **Backend**: Python Flask with MongoDB
- **Frontend**: React with Material-UI
- **Database**: MongoDB
- **Authentication**: JWT
- **Containerization**: Docker
- **Reverse Proxy**: Nginx
- **Virtualization**: Vagrant (for local server setup)
- **CI/CD**: GitHub Actions

## Features

- User registration and authentication
- Create, edit, and submit weekly reports
- View personal report history
- Admin dashboard to view all reports
- Modern, responsive design
- RESTful API
- JWT-based authentication

## Setup Instructions

### Prerequisites

- Docker and Docker Compose installed
- Git
- Vagrant (for VM setup) - [Installation Guide](https://developer.hashicorp.com/vagrant/install#linux)
- VirtualBox or another Vagrant provider

### Installation Options

#### Option 1: Local Development (Docker Compose)

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/weekly-report-system.git
cd weekly-report-system
```

2. Build and run with Docker Compose:
```bash
docker compose up -d --build
```

3. Access the application:
   - Backend API: http://localhost:5000
   - Frontend UI: http://localhost:3000

#### Option 2: Vagrant VM (Local Server - Replaces EC2)

This setup creates a local virtual machine using Vagrant, which acts as your development/production server.

1. Navigate to the vagrant directory:
```bash
cd vagrant
```

2. Start the Vagrant VM:
```bash
vagrant up
```

3. SSH into the VM:
```bash
vagrant ssh
```

4. Inside the VM, navigate to the project and start the application:
```bash
cd /home/vagrant/weekly-report-system
docker compose -f docker-compose.prod.yml up -d --build
```

5. Access the application:
   - Frontend: http://localhost:8888 (or http://192.168.56.10)
   - Backend API: http://localhost:5000

**SSH Setup for External Access:**

To enable SSH access from outside (for GitHub Actions deployment):

```bash
cd vagrant
./setup-ssh.sh
```

This will configure SSH keys for passwordless access to the VM.

For more details, see [vagrant/README.md](vagrant/README.md)

### Production Deployment

The project uses GitHub Actions for CI/CD (replacing Jenkins):

- **CI Pipeline** (`.github/workflows/ci.yml`): Runs tests on every push/PR
- **CD Pipeline** (`.github/workflows/cd.yml`): Deploys to production on main branch
- **Docker Build** (`.github/workflows/docker.yml`): Builds and pushes Docker images

**GitHub Actions Secrets Required:**
- `DOCKER_HUB_USERNAME`: Your Docker Hub username
- `DOCKER_HUB_ACCESS_TOKEN`: Docker Hub access token
- `VAGRANT_VM_HOST`: IP address of Vagrant VM (e.g., 192.168.56.10)
- `VAGRANT_VM_USER`: SSH username (usually `vagrant`)
- `VAGRANT_VM_SSH_KEY`: Private SSH key for VM access
- `VAGRANT_VM_PORT`: SSH port (usually 22)

**GitHub Variables Required:**
- `DOCKER_HUB_USERNAME`: Your Docker Hub username (for Docker login)

📖 **For detailed setup instructions, see [GITHUB_SETUP.md](GITHUB_SETUP.md)**

## Useful Notes

- Add a `.env` or export environment variables for secrets when running in production.
- Uploaded files are stored in `backend/uploads` (for local/dev only). Consider S3 or object storage for production.
- The Vagrant VM provides a local server environment that replaces EC2 for development and testing.
- GitHub Actions workflows automatically run tests and deploy on code changes (replacing Jenkins).

## Development

For local development without Vagrant, use Docker Compose directly. For a more production-like environment, use the Vagrant VM setup.

## Contributing

1. Create a feature branch
2. Make your changes
3. Push to GitHub - CI will automatically run tests
4. Create a pull request
5. After merge to main, CD will automatically deploy to the Vagrant VM
