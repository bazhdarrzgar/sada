#!/bin/bash

# SADA Project System Check Script
# Verifies that all required components are properly installed and running

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

check_passed=0
check_failed=0

print_check() {
    local status=$1
    local message=$2
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ PASS${NC} - $message"
        ((check_passed++))
    elif [ "$status" = "FAIL" ]; then
        echo -e "${RED}❌ FAIL${NC} - $message"
        ((check_failed++))
    elif [ "$status" = "WARN" ]; then
        echo -e "${YELLOW}⚠️  WARN${NC} - $message"
    else
        echo -e "${BLUE}ℹ️  INFO${NC} - $message"
    fi
}

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

check_port() {
    local port=$1
    nc -z localhost $port 2>/dev/null
}

echo
echo -e "${BLUE}🔍 SADA Project System Check${NC}"
echo -e "${BLUE}==============================${NC}"
echo

# Check Node.js
if command_exists node; then
    node_version=$(node -v)
    if [[ "$node_version" =~ ^v([0-9]+) ]]; then
        major_version=${BASH_REMATCH[1]}
        if [ "$major_version" -ge 18 ]; then
            print_check "PASS" "Node.js $node_version (>= v18 required)"
        else
            print_check "FAIL" "Node.js $node_version (< v18, please upgrade)"
        fi
    else
        print_check "WARN" "Node.js version format unrecognized: $node_version"
    fi
else
    print_check "FAIL" "Node.js not installed"
fi

# Check npm
if command_exists npm; then
    npm_version=$(npm -v)
    print_check "PASS" "npm $npm_version"
else
    print_check "FAIL" "npm not installed"
fi

# Check Yarn
if command_exists yarn; then
    yarn_version=$(yarn -v)
    print_check "PASS" "Yarn $yarn_version"
else
    print_check "FAIL" "Yarn not installed"
fi

# Check MongoDB
if command_exists mongod; then
    mongo_version=$(mongod --version | head -n1 | awk '{print $3}')
    print_check "PASS" "MongoDB $mongo_version installed"
    
    # Check if MongoDB is running
    if systemctl is-active --quiet mongod 2>/dev/null; then
        print_check "PASS" "MongoDB service is running"
        
        # Check MongoDB connection
        if check_port 27017; then
            print_check "PASS" "MongoDB is accepting connections on port 27017"
        else
            print_check "FAIL" "MongoDB is not accepting connections on port 27017"
        fi
    else
        print_check "FAIL" "MongoDB service is not running"
    fi
else
    print_check "FAIL" "MongoDB not installed"
fi

# Check Git
if command_exists git; then
    git_version=$(git --version | awk '{print $3}')
    print_check "PASS" "Git $git_version"
else
    print_check "FAIL" "Git not installed"
fi

# Check PM2
if command_exists pm2; then
    pm2_version=$(pm2 -v)
    print_check "PASS" "PM2 $pm2_version"
else
    print_check "WARN" "PM2 not installed (optional for production)"
fi

# Check Nginx
if command_exists nginx; then
    nginx_version=$(nginx -v 2>&1 | awk '{print $3}' | cut -d'/' -f2)
    print_check "PASS" "Nginx $nginx_version"
    
    if systemctl is-active --quiet nginx 2>/dev/null; then
        print_check "PASS" "Nginx service is running"
    else
        print_check "WARN" "Nginx service is not running (optional)"
    fi
else
    print_check "WARN" "Nginx not installed (optional for production)"
fi

# Check project files
echo
echo -e "${BLUE}📁 Project Files Check${NC}"
echo

if [ -f "package.json" ]; then
    print_check "PASS" "package.json exists"
    
    # Check if node_modules exists
    if [ -d "node_modules" ]; then
        print_check "PASS" "node_modules directory exists"
    else
        print_check "FAIL" "node_modules directory missing (run: yarn install)"
    fi
    
    # Check if .next build directory exists
    if [ -d ".next" ]; then
        print_check "PASS" ".next build directory exists"
    else
        print_check "WARN" ".next build directory missing (run: yarn build)"
    fi
else
    print_check "FAIL" "package.json not found (not in project directory?)"
fi

# Check environment file
if [ -f ".env.local" ]; then
    print_check "PASS" ".env.local file exists"
else
    print_check "WARN" ".env.local file missing (copy from .env.local.example if available)"
fi

# Check uploads directory
if [ -d "public/uploads" ]; then
    print_check "PASS" "public/uploads directory exists"
    
    if [ -w "public/uploads" ]; then
        print_check "PASS" "public/uploads directory is writable"
    else
        print_check "FAIL" "public/uploads directory is not writable"
    fi
else
    print_check "WARN" "public/uploads directory missing (will be created automatically)"
fi

# Check if development server is running
echo
echo -e "${BLUE}🌐 Services Check${NC}"
echo

if check_port 3000; then
    print_check "PASS" "Development server is running on port 3000"
    print_check "INFO" "Application URL: http://localhost:3000"
else
    print_check "WARN" "Development server is not running (start with: yarn dev)"
fi

# Check UFW firewall status
if command_exists ufw; then
    if ufw status | grep -q "Status: active"; then
        print_check "PASS" "UFW firewall is active"
    else
        print_check "WARN" "UFW firewall is inactive"
    fi
else
    print_check "WARN" "UFW firewall not installed"
fi

# Summary
echo
echo -e "${BLUE}📊 Check Summary${NC}"
echo -e "${BLUE}================${NC}"
echo

if [ $check_failed -eq 0 ]; then
    echo -e "${GREEN}🎉 All critical checks passed! ($check_passed passed)${NC}"
    echo -e "${GREEN}Your SADA installation appears to be working correctly.${NC}"
    echo
    echo -e "${BLUE}To start the application:${NC}"
    echo -e "${YELLOW}yarn dev${NC}"
    echo
    echo -e "${BLUE}Then visit:${NC}"
    echo -e "${YELLOW}http://localhost:3000${NC}"
else
    echo -e "${RED}⚠️  $check_failed critical issues found, $check_passed checks passed${NC}"
    echo -e "${RED}Please resolve the failed checks above before running the application.${NC}"
    echo
    echo -e "${BLUE}Common fixes:${NC}"
    echo "• Run: yarn install (for missing node_modules)"
    echo "• Run: sudo systemctl start mongod (for MongoDB issues)"
    echo "• Install missing components using setup-ubuntu.sh"
fi

echo