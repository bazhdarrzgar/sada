#!/bin/bash

# Sada Management System - Docker Setup Script
# This script helps you quickly set up the Sada system using Docker

set -e

echo "🏫 Sada - Berdoz Management System"
echo "🐳 Docker Setup Script"
echo "================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Compose."
    exit 1
fi

echo "✅ Docker is installed and ready"

# Function to setup development environment
setup_development() {
    echo ""
    echo "🚀 Setting up Development Environment..."
    echo "This will start MongoDB + Next.js with hot reload"
    
    # Use docker compose (newer) or docker-compose (legacy)
    if docker compose version &> /dev/null; then
        docker compose up -d
    else
        docker-compose up -d
    fi
    
    echo ""
    echo "✅ Development environment is ready!"
    echo "📱 Access the application at: http://localhost:3000"
    echo "🔑 Login credentials:"
    echo "   Username: berdoz"
    echo "   Password: berdoz@code"
}

# Function to setup production environment
setup_production() {
    echo ""
    echo "🏭 Setting up Production Environment..."
    
    # Check if .env.production exists
    if [ ! -f ".env.production" ]; then
        echo "📝 Creating production environment file..."
        cp .env.production.example .env.production
        
        # Generate secure password
        MONGO_PASSWORD=$(openssl rand -base64 32 2>/dev/null || echo "sada_$(date +%s)")
        sed -i "s/your_secure_mongodb_password_here/$MONGO_PASSWORD/g" .env.production
        
        echo "🔐 Generated secure MongoDB password"
        echo "📁 Created .env.production file"
        echo "⚠️  Please review .env.production and customize as needed"
    fi
    
    # Use docker compose (newer) or docker-compose (legacy)
    if docker compose version &> /dev/null; then
        docker compose -f docker-compose.prod.yml up -d
    else
        docker-compose -f docker-compose.prod.yml up -d
    fi
    
    echo ""
    echo "✅ Production environment is ready!"
    echo "📱 Access the application at: http://localhost:3000"
    echo "🔑 Login credentials:"
    echo "   Username: berdoz"
    echo "   Password: berdoz@code"
}

# Function to show status
show_status() {
    echo ""
    echo "📊 Current Docker Status:"
    echo "========================"
    
    if docker compose version &> /dev/null; then
        docker compose ps
    else
        docker-compose ps
    fi
    
    echo ""
    echo "🌐 Access URLs:"
    echo "  Main Application: http://localhost:3000"
    echo "  MongoDB: localhost:27017"
    
    echo ""
    echo "📋 Useful Commands:"
    echo "  View logs: docker-compose logs -f"
    echo "  Stop services: docker-compose down"
    echo "  Restart: docker-compose restart"
}

# Function to cleanup
cleanup() {
    echo ""
    echo "🧹 Cleaning up Docker resources..."
    
    read -p "This will stop all containers and remove volumes (⚠️  DATA LOSS). Continue? [y/N]: " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if docker compose version &> /dev/null; then
            docker compose down -v
        else
            docker-compose down -v
        fi
        docker system prune -f
        echo "✅ Cleanup completed"
    else
        echo "❌ Cleanup cancelled"
    fi
}

# Main menu
echo ""
echo "Please choose an option:"
echo "1) 🚀 Development Setup (with hot reload)"
echo "2) 🏭 Production Setup (with authentication)" 
echo "3) 📊 Show Status"
echo "4) 🧹 Cleanup Everything"
echo "5) ❌ Exit"
echo ""

read -p "Enter your choice [1-5]: " choice

case $choice in
    1)
        setup_development
        show_status
        ;;
    2)
        setup_production
        show_status
        ;;
    3)
        show_status
        ;;
    4)
        cleanup
        ;;
    5)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid option. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎉 Setup completed successfully!"
echo "📚 For more information, check the README.md file"
echo "🐛 If you encounter issues, run: docker-compose logs -f"