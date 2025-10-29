#!/bin/bash

# Docker Configuration Verification Script for Sada
# This script verifies that your Docker setup is correct

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

print_header() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════╗"
    echo "║   🔍 Sada Docker Configuration Verifier      ║"
    echo "╚═══════════════════════════════════════════════╝"
    echo -e "${NC}"
}

verify_files() {
    echo ""
    print_info "Checking required files..."
    
    local errors=0
    
    # Check Dockerfiles
    if [ -f "Dockerfile" ]; then
        print_success "Dockerfile exists"
    else
        print_error "Dockerfile not found"
        errors=$((errors + 1))
    fi
    
    if [ -f "Dockerfile.dev" ]; then
        print_success "Dockerfile.dev exists"
    else
        print_error "Dockerfile.dev not found"
        errors=$((errors + 1))
    fi
    
    # Check docker-compose
    if [ -f "docker-compose.yml" ]; then
        print_success "docker-compose.yml exists"
    else
        print_error "docker-compose.yml not found"
        errors=$((errors + 1))
    fi
    
    # Check .dockerignore
    if [ -f ".dockerignore" ]; then
        print_success ".dockerignore exists"
    else
        print_error ".dockerignore not found"
        errors=$((errors + 1))
    fi
    
    # Check package files
    if [ -f "package.json" ]; then
        print_success "package.json exists"
    else
        print_error "package.json not found"
        errors=$((errors + 1))
    fi
    
    if [ -f "yarn.lock" ]; then
        print_success "yarn.lock exists"
    else
        print_info "yarn.lock not found (will be generated on first install)"
    fi
    
    # Check next.config.js
    if [ -f "next.config.js" ]; then
        print_success "next.config.js exists"
        
        # Check if standalone mode is enabled
        if grep -q "output.*standalone" next.config.js; then
            print_success "Standalone mode is enabled in next.config.js"
        else
            print_error "Standalone mode not enabled in next.config.js"
            errors=$((errors + 1))
        fi
    else
        print_error "next.config.js not found"
        errors=$((errors + 1))
    fi
    
    return $errors
}

verify_docker_config() {
    echo ""
    print_info "Verifying Docker configuration..."
    
    local errors=0
    
    # Check for SQLite dependencies in Dockerfile
    if grep -q "better-sqlite3" Dockerfile && grep -q "python3" Dockerfile && grep -q "make" Dockerfile; then
        print_success "SQLite build dependencies configured in Dockerfile"
    else
        print_error "Missing SQLite build dependencies in Dockerfile"
        errors=$((errors + 1))
    fi
    
    # Check for database directory creation
    if grep -q "mkdir.*database" Dockerfile; then
        print_success "Database directory creation configured"
    else
        print_error "Database directory creation not configured"
        errors=$((errors + 1))
    fi
    
    # Check for upload directory creation
    if grep -q "mkdir.*upload" Dockerfile; then
        print_success "Upload directory creation configured"
    else
        print_error "Upload directory creation not configured"
        errors=$((errors + 1))
    fi
    
    # Check docker-compose for MongoDB (should NOT exist)
    if grep -q "mongodb" docker-compose.yml; then
        print_error "MongoDB configuration found in docker-compose.yml (should be removed for SQLite)"
        errors=$((errors + 1))
    else
        print_success "No MongoDB configuration in docker-compose.yml (correct for SQLite)"
    fi
    
    # Check for SQLite volume
    if grep -q "sqlite_data" docker-compose.yml; then
        print_success "SQLite data volume configured in docker-compose.yml"
    else
        print_error "SQLite data volume not configured in docker-compose.yml"
        errors=$((errors + 1))
    fi
    
    # Check for upload volume
    if grep -q "upload_data" docker-compose.yml; then
        print_success "Upload data volume configured in docker-compose.yml"
    else
        print_error "Upload data volume not configured in docker-compose.yml"
        errors=$((errors + 1))
    fi
    
    return $errors
}

verify_dependencies() {
    echo ""
    print_info "Checking package dependencies..."
    
    local errors=0
    
    # Check for better-sqlite3
    if grep -q "better-sqlite3" package.json; then
        print_success "better-sqlite3 dependency found in package.json"
    else
        print_error "better-sqlite3 not found in package.json"
        errors=$((errors + 1))
    fi
    
    # Check for Next.js
    if grep -q "\"next\"" package.json; then
        print_success "Next.js dependency found in package.json"
    else
        print_error "Next.js not found in package.json"
        errors=$((errors + 1))
    fi
    
    # Check for React
    if grep -q "\"react\"" package.json; then
        print_success "React dependency found in package.json"
    else
        print_error "React not found in package.json"
        errors=$((errors + 1))
    fi
    
    return $errors
}

verify_scripts() {
    echo ""
    print_info "Checking helper scripts..."
    
    local errors=0
    
    if [ -f "docker-start.sh" ]; then
        print_success "docker-start.sh exists"
        if [ -x "docker-start.sh" ]; then
            print_success "docker-start.sh is executable"
        else
            print_error "docker-start.sh is not executable (run: chmod +x docker-start.sh)"
            errors=$((errors + 1))
        fi
    else
        print_info "docker-start.sh not found (optional)"
    fi
    
    if [ -f "docker-health-check.sh" ]; then
        print_success "docker-health-check.sh exists"
        if [ -x "docker-health-check.sh" ]; then
            print_success "docker-health-check.sh is executable"
        else
            print_error "docker-health-check.sh is not executable (run: chmod +x docker-health-check.sh)"
            errors=$((errors + 1))
        fi
    else
        print_info "docker-health-check.sh not found (optional)"
    fi
    
    return $errors
}

verify_directories() {
    echo ""
    print_info "Checking directory structure..."
    
    local errors=0
    
    if [ -d "database" ]; then
        print_success "database directory exists"
    else
        print_info "database directory not found (will be created automatically)"
    fi
    
    if [ -d "public/upload" ]; then
        print_success "public/upload directory exists"
    else
        print_info "public/upload directory not found (will be created automatically)"
    fi
    
    if [ -d "app" ]; then
        print_success "app directory exists (Next.js pages)"
    else
        print_error "app directory not found"
        errors=$((errors + 1))
    fi
    
    if [ -d "components" ]; then
        print_success "components directory exists"
    else
        print_error "components directory not found"
        errors=$((errors + 1))
    fi
    
    return $errors
}

show_recommendations() {
    echo ""
    echo "═══════════════════════════════════════════════"
    print_info "Recommendations:"
    echo ""
    echo "1. Create .env file from .env.example if needed:"
    echo "   cp .env.example .env"
    echo ""
    echo "2. Review and update environment variables in .env"
    echo ""
    echo "3. Start the application:"
    echo "   ./docker-start.sh"
    echo "   OR"
    echo "   docker-compose up -d app"
    echo ""
    echo "4. Check health after startup:"
    echo "   ./docker-health-check.sh"
    echo ""
    echo "5. View logs:"
    echo "   docker-compose logs -f app"
    echo "═══════════════════════════════════════════════"
}

main() {
    print_header
    
    local total_errors=0
    
    # Run all verifications
    verify_files || total_errors=$((total_errors + $?))
    verify_docker_config || total_errors=$((total_errors + $?))
    verify_dependencies || total_errors=$((total_errors + $?))
    verify_scripts || total_errors=$((total_errors + $?))
    verify_directories || total_errors=$((total_errors + $?))
    
    echo ""
    echo "═══════════════════════════════════════════════"
    
    if [ $total_errors -eq 0 ]; then
        print_success "All verifications passed! 🎉"
        echo ""
        print_success "Your Docker configuration is ready for deployment!"
        show_recommendations
    else
        print_error "Found $total_errors issue(s) that need attention"
        echo ""
        print_error "Please fix the issues above before deploying"
    fi
    
    echo "═══════════════════════════════════════════════"
    echo ""
    
    exit $total_errors
}

main
