#!/bin/bash

# Berdoz Management System Database Seeding Script
# This script runs the seed-database.js file to populate MongoDB with sample data

echo "🚀 Starting Berdoz Management System Database Seeding..."
echo "========================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  Warning: MongoDB may not be running. Attempting to start..."
    # Try to start MongoDB if it's not running
    if command -v systemctl &> /dev/null; then
        sudo systemctl start mongod
    else
        echo "❌ Error: Cannot start MongoDB. Please start MongoDB manually."
        exit 1
    fi
fi

# Check if the seed file exists
if [ ! -f "seed-database.js" ]; then
    echo "❌ Error: seed-database.js file not found in current directory."
    exit 1
fi

# Load environment variables if .env.local exists
if [ -f ".env.local" ]; then
    echo "📄 Loading environment variables from .env.local..."
    export $(cat .env.local | xargs)
fi

# Set default values if environment variables are not set
export MONGO_URL=${MONGO_URL:-"mongodb://localhost:27017"}
export DB_NAME=${DB_NAME:-"berdoz_management"}

echo "🔧 Configuration:"
echo "   MongoDB URL: $MONGO_URL"
echo "   Database Name: $DB_NAME"
echo ""

# Run the seeding script
echo "🌱 Running database seeding script..."
echo "========================================="

node seed-database.js

# Check the exit status
if [ $? -eq 0 ]; then
    echo ""
    echo "========================================="
    echo "✅ Database seeding completed successfully!"
    echo ""
    echo "📊 Summary:"
    echo "   - Calendar entries: 12 months of comprehensive data"
    echo "   - Staff records: 15 detailed employee profiles"
    echo "   - Teachers: 15 comprehensive teacher records"
    echo "   - Teacher info: 15 detailed teacher information"
    echo "   - Supervised students: 15 student monitoring records"
    echo "   - Payroll: 15 complete salary records"
    echo "   - Activities: 12 diverse school activities"
    echo "   - Exam supervision: 15 examination oversight records"
    echo "   - Employee leaves: 12 leave management records"
    echo "   - Supervision: 12 administrative supervision records"
    echo "   - Installments: 15 student payment tracking records"
    echo "   - Monthly expenses: 12 complete monthly expense records"
    echo "   - Building expenses: 12 infrastructure maintenance records"
    echo "   - Daily accounts: 15 financial transaction records"
    echo "   - Kitchen expenses: 12 food service expense records"
    echo "   - Student permissions: 15 permission management records"
    echo "   - Legend entries: 15 system abbreviation definitions"
    echo ""
    echo "🎯 Next Steps:"
    echo "   1. Start your Next.js application: yarn dev"
    echo "   2. Access the system at: http://localhost:3000"
    echo "   3. Login with: username 'berdoz', password 'berdoz@code'"
    echo ""
    echo "🎉 Your Berdoz Management System is ready to use!"
else
    echo ""
    echo "========================================="
    echo "❌ Database seeding failed!"
    echo ""
    echo "🔍 Troubleshooting:"
    echo "   1. Check if MongoDB is running:"
    echo "      ps aux | grep mongod"
    echo ""
    echo "   2. Check MongoDB connection:"
    echo "      mongosh --eval \"db.adminCommand('ping')\""
    echo ""
    echo "   3. Verify environment variables:"
    echo "      echo \$MONGO_URL"
    echo "      echo \$DB_NAME"
    echo ""
    echo "   4. Check Node.js dependencies:"
    echo "      yarn install"
    echo ""
    exit 1
fi