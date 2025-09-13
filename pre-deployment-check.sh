#!/bin/bash

##############################################################################
# SADA Management System - Pre-Deployment System Check
# Verifies that your VPS is ready for SADA deployment
##############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[✅ PASS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[⚠️  WARN]${NC} $1"; }
print_error() { echo -e "${RED}[❌ FAIL]${NC} $1"; }

echo "🔍 SADA Management System - Pre-Deployment Check"
echo "================================================"
echo

# Initialize counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

check_pass() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
    print_success "$1"
}

check_fail() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
    print_error "$1"
}

check_warn() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    WARNING_CHECKS=$((WARNING_CHECKS + 1))
    print_warning "$1"
}

# Check 1: Operating System
print_status "Checking operating system..."
if grep -q "Ubuntu" /etc/os-release; then
    VERSION=$(grep VERSION_ID /etc/os-release | cut -d'"' -f2)
    if [[ $(echo "$VERSION >= 20.04" | bc -l) == 1 ]]; then
        check_pass "Ubuntu $VERSION (Supported)"
    else
        check_warn "Ubuntu $VERSION (Older version, may have compatibility issues)"
    fi
elif grep -q "Debian" /etc/os-release; then
    check_warn "Debian detected (Should work, but Ubuntu is recommended)"
else
    check_fail "Unsupported operating system (Ubuntu 20.04+ recommended)"
fi

# Check 2: System Resources
print_status "Checking system resources..."

# Memory check
TOTAL_MEM=$(free -m | awk 'NR==2{printf "%.0f", $2}')
if [ "$TOTAL_MEM" -ge 1024 ]; then
    check_pass "RAM: ${TOTAL_MEM}MB (Sufficient)"
elif [ "$TOTAL_MEM" -ge 900 ]; then
    check_warn "RAM: ${TOTAL_MEM}MB (Minimal, will work with swap)"
else
    check_fail "RAM: ${TOTAL_MEM}MB (Insufficient, need at least 900MB)"
fi

# Disk space check
AVAILABLE_SPACE_GB=$(df / | tail -1 | awk '{printf "%.1f", $4/1024/1024}')
if (( $(echo "$AVAILABLE_SPACE_GB >= 10.0" | bc -l) )); then
    check_pass "Disk space: ${AVAILABLE_SPACE_GB}GB available (Sufficient)"
elif (( $(echo "$AVAILABLE_SPACE_GB >= 5.0" | bc -l) )); then
    check_warn "Disk space: ${AVAILABLE_SPACE_GB}GB available (Minimal)"
else
    check_fail "Disk space: ${AVAILABLE_SPACE_GB}GB available (Insufficient, need at least 5GB)"
fi

# CPU check
CPU_CORES=$(nproc)
if [ "$CPU_CORES" -ge 2 ]; then
    check_pass "CPU cores: $CPU_CORES (Good)"
elif [ "$CPU_CORES" -eq 1 ]; then
    check_warn "CPU cores: $CPU_CORES (Minimal, will work but may be slow)"
else
    check_fail "CPU cores: $CPU_CORES (Insufficient)"
fi

# Check 3: Network connectivity
print_status "Checking network connectivity..."
if ping -c 1 google.com >/dev/null 2>&1; then
    check_pass "Internet connectivity (Working)"
else
    check_fail "Internet connectivity (Failed)"
fi

# Check 4: Required commands
print_status "Checking required system commands..."

REQUIRED_COMMANDS=("curl" "wget" "git" "sudo" "systemctl" "apt-get")
for cmd in "${REQUIRED_COMMANDS[@]}"; do
    if command -v "$cmd" >/dev/null 2>&1; then
        check_pass "Command '$cmd' (Available)"
    else
        check_fail "Command '$cmd' (Missing - will be installed)"
    fi
done

# Check 5: User privileges
print_status "Checking user privileges..."
if [ "$EUID" -eq 0 ]; then
    check_warn "Running as root (Not recommended for security)"
elif sudo -n true 2>/dev/null; then
    check_pass "Sudo privileges (Available)"
else
    check_fail "Sudo privileges (Required - run 'sudo -v' first)"
fi

# Check 6: Port availability
print_status "Checking port availability..."
REQUIRED_PORTS=(80 443 3000 27017)
for port in "${REQUIRED_PORTS[@]}"; do
    if ! sudo netstat -tulpn 2>/dev/null | grep -q ":$port "; then
        check_pass "Port $port (Available)"
    else
        check_warn "Port $port (In use - may cause conflicts)"
    fi
done

# Check 7: System architecture
print_status "Checking system architecture..."
ARCH=$(dpkg --print-architecture 2>/dev/null || uname -m)
if [[ "$ARCH" == "amd64" || "$ARCH" == "x86_64" ]]; then
    check_pass "Architecture: $ARCH (Supported)"
elif [[ "$ARCH" == "arm64" || "$ARCH" == "aarch64" ]]; then
    check_pass "Architecture: $ARCH (Supported)"
else
    check_fail "Architecture: $ARCH (Unsupported)"
fi

# Check 8: Existing Docker installation
print_status "Checking existing Docker installation..."
if command -v docker >/dev/null 2>&1; then
    DOCKER_VERSION=$(docker --version 2>/dev/null | cut -d' ' -f3 | cut -d',' -f1)
    check_pass "Docker $DOCKER_VERSION (Already installed)"
    
    if command -v docker-compose >/dev/null 2>&1; then
        COMPOSE_VERSION=$(docker-compose --version 2>/dev/null | cut -d' ' -f3 | cut -d',' -f1)
        check_pass "Docker Compose $COMPOSE_VERSION (Already installed)"
    else
        check_warn "Docker Compose (Not installed - will be installed)"
    fi
else
    check_warn "Docker (Not installed - will be installed)"
fi

# Check 9: Firewall status
print_status "Checking firewall configuration..."
if command -v ufw >/dev/null 2>&1; then
    UFW_STATUS=$(sudo ufw status | head -1 | awk '{print $2}')
    if [ "$UFW_STATUS" = "active" ]; then
        check_pass "UFW firewall (Active)"
    else
        check_warn "UFW firewall (Inactive - will be configured)"
    fi
else
    check_warn "UFW firewall (Not installed - will be installed)"
fi

# Check 10: Swap configuration
print_status "Checking swap configuration..."
SWAP_SIZE=$(free -m | awk 'NR==3{printf "%.0f", $2}')
if [ "$SWAP_SIZE" -gt 0 ]; then
    check_pass "Swap: ${SWAP_SIZE}MB (Configured)"
else
    check_warn "Swap: ${SWAP_SIZE}MB (Not configured - will be created)"
fi

# Check 11: System updates
print_status "Checking system update status..."
if [ -f /var/run/reboot-required ]; then
    check_warn "System reboot required (Run 'sudo reboot' after package updates)"
fi

# Check available updates
UPDATES=$(apt list --upgradable 2>/dev/null | wc -l)
if [ "$UPDATES" -gt 1 ]; then
    check_warn "System updates available: $((UPDATES-1)) packages"
else
    check_pass "System up to date"
fi

# Summary
echo
echo "=========================================="
echo "📊 PRE-DEPLOYMENT CHECK SUMMARY"
echo "=========================================="
echo "Total checks: $TOTAL_CHECKS"
echo -e "✅ Passed: ${GREEN}$PASSED_CHECKS${NC}"
echo -e "⚠️  Warnings: ${YELLOW}$WARNING_CHECKS${NC}"
echo -e "❌ Failed: ${RED}$FAILED_CHECKS${NC}"
echo

# Recommendations
if [ "$FAILED_CHECKS" -gt 0 ]; then
    echo -e "${RED}🚨 CRITICAL ISSUES FOUND${NC}"
    echo "Please resolve the failed checks before proceeding with deployment."
    echo
    echo "Common solutions:"
    echo "• Insufficient RAM: Upgrade VPS or add swap file"
    echo "• Missing sudo: Add user to sudo group"
    echo "• Network issues: Check DNS and firewall settings"
    echo "• Disk space: Clean up files or upgrade storage"
    echo
    exit 1
elif [ "$WARNING_CHECKS" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  WARNINGS DETECTED${NC}"
    echo "Your system will likely work, but consider addressing warnings for optimal performance."
    echo
    echo "Recommendations:"
    if [ "$TOTAL_MEM" -lt 1024 ]; then
        echo "• Consider adding more RAM for better performance"
    fi
    if (( $(echo "$AVAILABLE_SPACE_GB < 10.0" | bc -l) )); then
        echo "• Monitor disk usage regularly"
    fi
    if [ "$CPU_CORES" -eq 1 ]; then
        echo "• Single CPU core may cause slower performance"
    fi
    echo
    echo -e "${GREEN}✅ System is READY for deployment!${NC}"
    echo
else
    echo -e "${GREEN}🎉 EXCELLENT! Your system passes all checks!${NC}"
    echo "Your VPS is optimally configured for SADA deployment."
    echo
fi

# Next steps
echo "📋 NEXT STEPS:"
echo "1. Run the full deployment script:"
echo "   wget https://raw.githubusercontent.com/bazhdarrzgar/sada/main/deploy-sada-production.sh"
echo "   chmod +x deploy-sada-production.sh"
echo "   ./deploy-sada-production.sh"
echo
echo "2. Or run the quick deployment:"
echo "   wget https://raw.githubusercontent.com/bazhdarrzgar/sada/main/quick-deploy.sh"
echo "   chmod +x quick-deploy.sh"
echo "   ./quick-deploy.sh"
echo
echo "💡 TIP: For production environments, use the full deployment script for better security and optimization."
echo

# System optimization suggestions
if [ "$TOTAL_MEM" -lt 1536 ]; then
    echo "🔧 MEMORY OPTIMIZATION TIPS:"
    echo "• The deployment will automatically create swap space"
    echo "• MongoDB cache will be limited to conserve memory"
    echo "• Node.js heap size will be optimized for your RAM"
    echo
fi

if [ "$CPU_CORES" -eq 1 ]; then
    echo "⚡ PERFORMANCE TIPS:"
    echo "• Single-core optimization will be applied automatically"
    echo "• Consider upgrading to 2+ cores for better performance"
    echo "• Monitor CPU usage with 'htop' after deployment"
    echo
fi

echo "For support and documentation, visit:"
echo "📚 https://github.com/bazhdarrzgar/sada"
echo