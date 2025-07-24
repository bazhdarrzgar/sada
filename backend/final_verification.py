#!/usr/bin/env python3
import requests
import json

def verify_all_endpoints():
    base_url = "http://localhost:8001/api"
    
    modules = [
        "calendar",
        "staff", 
        "payroll",
        "supervision",
        "installments",
        "monthly-expenses",
        "daily-accounts"
    ]
    
    print("🔥 FINAL VERIFICATION: ALL 7 MODULES CONNECTED TO MONGODB")
    print("=" * 60)
    
    all_working = True
    
    for module in modules:
        try:
            # Test GET endpoint
            response = requests.get(f"{base_url}/{module}")
            if response.status_code == 200:
                data = response.json()
                count = len(data)
                status = "✅ CONNECTED" if count > 0 else "⚠️  EMPTY"
                print(f"{module.upper():15}: {status} ({count} records)")
                
                if count == 0:
                    all_working = False
            else:
                print(f"{module.upper():15}: ❌ FAILED (HTTP {response.status_code})")
                all_working = False
                
        except Exception as e:
            print(f"{module.upper():15}: ❌ ERROR - {e}")
            all_working = False
    
    print("=" * 60)
    
    if all_working:
        print("🎉 SUCCESS: ALL 7 MODULES ARE FULLY CONNECTED TO MONGODB!")
        print("   📅 بەڕێوەبردنی ساڵنامە (Calendar Management)")
        print("   👥 تۆمارەکانی ستاف (Staff Records)")  
        print("   💰 لیستی بڕی موچە (Payroll Management)")
        print("   🔍 چاودێری (Supervision System)")
        print("   💳 قیستی ساڵانه (Annual Installments)")
        print("   📊 خەرجی مانگانه (Monthly Expenses)")
        print("   📋 حساباتی رۆژانه (Daily Accounts)")
        print("\n🚀 Database URL: mongodb://localhost:27017/berdoz_management")
        print("🌐 API Base URL: http://localhost:8001/api")
        print("💻 Frontend URL: http://localhost:3000")
    else:
        print("❌ Some modules are not properly connected to MongoDB")
    
    return all_working

if __name__ == "__main__":
    verify_all_endpoints()