#!/bin/bash

# SADA Project Ubuntu Installation Script
# This script installs all dependencies needed to run the SADA project on a fresh Ubuntu OS
# Compatible with Ubuntu 20.04, 22.04, and newer versions
# Author: E1 Assistant
# Version: 1.0

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}[SETUP]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Ubuntu version
check_ubuntu_version() {
    if ! command_exists lsb_release; then
        print_error "This script is designed for Ubuntu. Please install on Ubuntu 20.04+ or install lsb_release."
        exit 1
    fi
    
    local version=$(lsb_release -rs)
    local major_version=$(echo $version | cut -d. -f1)
    
    if [ "$major_version" -lt 20 ]; then
        print_warning "This script is tested on Ubuntu 20.04+. Your version: $version"
        echo "Do you want to continue anyway? (y/n)"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        print_success "Ubuntu version $version detected. Compatible!"
    fi
}

# Function to update system packages
update_system() {
    print_header "Updating system packages..."
    sudo apt update
    sudo apt upgrade -y
    sudo apt install -y curl wget gnupg2 software-properties-common apt-transport-https ca-certificates lsb-release
    print_success "System packages updated!"
}

# Function to install Node.js and npm
install_nodejs() {
    print_header "Installing Node.js and npm..."
    
    if command_exists node; then
        local node_version=$(node -v)
        print_warning "Node.js is already installed: $node_version"
        echo "Do you want to reinstall? (y/n)"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            return 0
        fi
    fi
    
    # Install Node.js 20.x (LTS) using NodeSource repository
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    
    # Verify installation
    local node_version=$(node -v)
    local npm_version=$(npm -v)
    print_success "Node.js installed: $node_version"
    print_success "npm installed: $npm_version"
    
    # Install global packages for development
    sudo npm install -g pm2 wait-on
    print_success "Global npm packages installed (pm2, wait-on)"
}

# Function to install Yarn
install_yarn() {
    print_header "Installing Yarn package manager..."
    
    if command_exists yarn; then
        local yarn_version=$(yarn -v)
        print_warning "Yarn is already installed: $yarn_version"
        return 0
    fi
    
    # Install Yarn using npm (recommended method)
    sudo npm install -g yarn
    
    # Verify installation
    local yarn_version=$(yarn -v)
    print_success "Yarn installed: $yarn_version"
}

# Function to install MongoDB
install_mongodb() {
    print_header "Installing MongoDB..."
    
    if command_exists mongod; then
        print_warning "MongoDB is already installed"
        echo "Do you want to reinstall? (y/n)"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            return 0
        fi
    fi
    
    # Import MongoDB public GPG key
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
        sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
        --dearmor
    
    # Add MongoDB repository
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | \
        sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    
    # Update package database and install MongoDB
    sudo apt update
    sudo apt install -y mongodb-org
    
    # Start and enable MongoDB
    sudo systemctl start mongod
    sudo systemctl enable mongod
    
    # Verify installation
    if sudo systemctl is-active --quiet mongod; then
        print_success "MongoDB installed and running!"
        print_status "MongoDB version: $(mongod --version | head -n1)"
    else
        print_error "MongoDB installation failed or service is not running"
        exit 1
    fi
}

# Function to install Git (if not already installed)
install_git() {
    print_header "Installing Git..."
    
    if command_exists git; then
        local git_version=$(git --version)
        print_success "Git is already installed: $git_version"
        return 0
    fi
    
    sudo apt install -y git
    print_success "Git installed: $(git --version)"
}

# Function to install additional development tools
install_dev_tools() {
    print_header "Installing additional development tools..."
    
    # Install build essentials and other useful tools
    sudo apt install -y \
        build-essential \
        python3 \
        python3-pip \
        vim \
        nano \
        htop \
        tree \
        unzip \
        zip \
        jq \
        nginx \
        supervisor
    
    print_success "Development tools installed!"
}

# Function to configure firewall
configure_firewall() {
    print_header "Configuring firewall..."
    
    # Enable UFW if not already enabled
    if ! sudo ufw status | grep -q "Status: active"; then
        # Allow SSH first to prevent lockout
        sudo ufw allow ssh
        
        # Allow HTTP and HTTPS
        sudo ufw allow 80
        sudo ufw allow 443
        
        # Allow Node.js development server (port 3000)
        sudo ufw allow 3000
        
        # Allow MongoDB (port 27017) - only from localhost for security
        sudo ufw allow from 127.0.0.1 to any port 27017
        
        # Enable firewall
        sudo ufw --force enable
        print_success "Firewall configured and enabled!"
    else
        print_success "Firewall is already configured!"
    fi
}

# Function to create environment file template
create_env_template() {
    print_header "Creating environment file template..."
    
    local env_file=".env.local"
    
    if [ -f "$env_file" ]; then
        print_warning "$env_file already exists. Skipping creation."
        return 0
    fi
    
    cat > "$env_file" << 'EOF'
# Environment Configuration for SADA Project
# Copy this file and customize the values as needed

# Database Configuration
MONGODB_URI=mongodb://localhost:27017
MONGO_URL=mongodb://localhost:27017
DB_NAME=berdoz_management

# Application Configuration
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:3000

# Session Configuration (generate a secure secret)
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Email Configuration (if using email features)
# SMTP_HOST=your-smtp-host
# SMTP_PORT=587
# SMTP_USER=your-email@domain.com
# SMTP_PASS=your-email-password

# File Upload Configuration
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=5242880

# Security Configuration
BCRYPT_ROUNDS=12

# Development Configuration
NEXT_TELEMETRY_DISABLED=1
EOF
    
    print_success "Environment template created: $env_file"
    print_warning "Please review and update the environment variables in $env_file"
}

# Function to setup project
setup_project() {
    print_header "Setting up SADA project..."
    
    # Check if we're already in the project directory
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Please run this script from the project root directory."
        print_status "If you need to clone the project first, run:"
        print_status "git clone https://github.com/bazhdarrzgar/sada.git"
        print_status "cd sada"
        print_status "./setup-ubuntu.sh"
        exit 1
    fi
    
    # Install project dependencies
    print_status "Installing project dependencies with Yarn..."
    yarn install
    
    # Run database seeding if scripts exist
    if [ -f "scripts/seedDatabase.js" ]; then
        print_status "Setting up database with initial data..."
        node scripts/seedDatabase.js
        print_success "Database seeded successfully!"
    fi
    
    print_success "Project setup completed!"
}

# Function to start services
start_services() {
    print_header "Starting services..."
    
    # Ensure MongoDB is running
    if ! sudo systemctl is-active --quiet mongod; then
        sudo systemctl start mongod
        print_success "MongoDB started!"
    fi
    
    # Start the development server
    print_status "Starting development server..."
    print_status "You can start the development server with:"
    echo -e "${CYAN}yarn dev${NC}"
    echo -e "Or use PM2 for production:"
    echo -e "${CYAN}yarn build && pm2 start yarn --name sada -- start${NC}"
}

# Function to display final instructions
show_final_instructions() {
    print_header "Installation Complete! 🎉"
    
    echo
    echo -e "${GREEN}✅ System Requirements Installed:${NC}"
    echo "   - Node.js $(node -v)"
    echo "   - npm $(npm -v)"
    echo "   - Yarn $(yarn -v)"
    echo "   - MongoDB $(mongod --version | head -n1 | awk '{print $3}')"
    echo "   - Git $(git --version | awk '{print $3}')"
    
    echo
    echo -e "${YELLOW}📝 Next Steps:${NC}"
    echo "1. Review and update the environment file: .env.local"
    echo "2. Start the development server:"
    echo -e "   ${CYAN}yarn dev${NC}"
    echo "3. Open your browser and go to: http://localhost:3000"
    echo
    echo -e "${BLUE}🔧 Useful Commands:${NC}"
    echo -e "   ${CYAN}yarn dev${NC}               - Start development server"
    echo -e "   ${CYAN}yarn build${NC}             - Build for production"
    echo -e "   ${CYAN}yarn start${NC}             - Start production server"
    echo -e "   ${CYAN}sudo systemctl status mongod${NC} - Check MongoDB status"
    echo -e "   ${CYAN}pm2 list${NC}               - List PM2 processes"
    echo
    echo -e "${GREEN}🚀 Happy coding with SADA! ${NC}"
    echo
}

# Function to handle script interruption
cleanup() {
    print_warning "Script interrupted. Cleaning up..."
    exit 1
}

# Trap script interruption
trap cleanup SIGINT SIGTERM

# Main installation process
main() {
    echo
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}  SADA Project Ubuntu Setup     ${NC}"
    echo -e "${PURPLE}================================${NC}"
    echo
    
    # Check if running as root
    if [ "$EUID" -eq 0 ]; then
        print_error "Please do not run this script as root. Use a regular user with sudo privileges."
        exit 1
    fi
    
    # Check if sudo is available
    if ! command_exists sudo; then
        print_error "sudo is required but not installed. Please install sudo first."
        exit 1
    fi
    
    # Pre-flight checks
    check_ubuntu_version
    
    # Installation steps
    update_system
    install_git
    install_nodejs
    install_yarn
    install_mongodb
    install_dev_tools
    configure_firewall
    create_env_template
    setup_project
    start_services
    show_final_instructions
}

# Run the main function
main "$@"