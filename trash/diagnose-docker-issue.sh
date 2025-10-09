#!/bin/bash

# Docker Issue Diagnostic Script

echo "🔍 Docker Issue Diagnosis"
echo "========================="

# Check if we need sudo for docker commands
if groups $USER | grep -q docker 2>/dev/null; then
    DOCKER_CMD="docker"
    COMPOSE_CMD="docker-compose"
    echo "✅ User has Docker permissions"
else
    DOCKER_CMD="sudo docker"
    COMPOSE_CMD="sudo docker-compose"
    echo "⚠️  Using sudo for Docker commands"
fi

echo ""
echo "📊 Current Container Status:"
$COMPOSE_CMD ps 2>/dev/null || echo "No containers found or compose file missing"

echo ""
echo "📋 Application Container Logs (last 15 lines):"
if $DOCKER_CMD ps -a | grep -q "sada_app"; then
    $DOCKER_CMD logs sada_app --tail=15 2>/dev/null || echo "Cannot access logs"
else
    echo "No sada_app container found"
fi

echo ""
echo "🌐 Port 3000 Status:"
if netstat -tlnp 2>/dev/null | grep -q ":3000 "; then
    echo "✅ Port 3000 is in use"
    netstat -tlnp | grep ":3000 " 2>/dev/null || true
elif ss -tlnp 2>/dev/null | grep -q ":3000 "; then
    echo "✅ Port 3000 is in use"
    ss -tlnp | grep ":3000 " || true
else
    echo "❌ Port 3000 is not in use"
fi

echo ""
echo "🐳 Docker Images:"
$DOCKER_CMD images | grep -E "(sada|mongo)" || echo "No relevant images found"

echo ""
echo "📁 Upload Directories:"
if [ -d "./public/upload" ]; then
    echo "✅ Upload directories exist:"
    ls -la ./public/upload/ 2>/dev/null || true
else
    echo "❌ Upload directories missing"
fi

echo ""
echo "⚙️ Key Files Status:"
echo "- docker-compose.yml: $([ -f 'docker-compose.yml' ] && echo '✅ Present' || echo '❌ Missing')"
echo "- Dockerfile: $([ -f 'Dockerfile' ] && echo '✅ Present' || echo '❌ Missing')"
echo "- docker-entrypoint.sh: $([ -f 'docker-entrypoint.sh' ] && echo '✅ Present' || echo '❌ Missing')"
echo "- package.json: $([ -f 'package.json' ] && echo '✅ Present' || echo '❌ Missing')"
echo "- next.config.js: $([ -f 'next.config.js' ] && echo '✅ Present' || echo '❌ Missing')"

echo ""
echo "🔧 Recommended Actions:"
if $DOCKER_CMD ps -a | grep -q "Restarting"; then
    echo "1. Container is restarting - use './fix-docker-port-issue.sh' to fix"
elif ! netstat -tlnp 2>/dev/null | grep -q ":3000 " && ! ss -tlnp 2>/dev/null | grep -q ":3000 "; then
    echo "1. Port 3000 is not in use - container might not be running"
    echo "2. Try: $COMPOSE_CMD up -d"
else
    echo "1. Port 3000 seems to be working"
    echo "2. Test: curl http://localhost:3000"
fi