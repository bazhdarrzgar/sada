#!/usr/bin/env python3
import asyncio
import requests
import json

# Test data for each module
test_data = {
    "calendar": {
        "month": "Test-Month",
        "week1": ["TB", "C1", "B,J", "S", "A,C"],
        "week2": ["B,T", "D", "B,N", "C1", "A,C"],
        "week3": ["B,T", "D", "B,N", "C1", "A,C"],
        "week4": ["TB", "V,P", "L,Q,X", "G,B1", "O,J"]
    },
    "staff": {
        "fullName": "Test Employee",
        "mobile": "+964 750 123 4567",
        "address": "Test Address",
        "gender": "Male",
        "dateOfBirth": "1990-01-01",
        "marriage": "Married",
        "certificate": "Bachelor",
        "age": 34,
        "education": "University",
        "attendance": "Present",
        "date": "2025-01-15",
        "department": "IT",
        "pass": "Grade A",
        "contract": "Permanent"
    },
    "payroll": {
        "employeeName": "Test Employee",
        "salary": 1000,
        "absence": 0,
        "deduction": 0,
        "bonus": 100,
        "total": 1100,
        "notes": "Test payroll"
    },
    "supervision": {
        "teacherName": "Test Teacher",
        "subject": "Mathematics",
        "teacherDepartment": "Science",
        "teacherGrade": "High School",
        "teacherViolationType": "None",
        "teacherPunishmentType": "None",
        "studentName": "Test Student",
        "studentDepartment": "Science",
        "studentGrade": "Grade 10",
        "studentViolationType": "None",
        "studentPunishmentType": "None"
    },
    "installments": {
        "fullName": "Test Student",
        "grade": "Grade 10",
        "installmentType": "Annual",
        "annualAmount": 1000000,
        "firstInstallment": 200000,
        "secondInstallment": 200000,
        "thirdInstallment": 200000,
        "fourthInstallment": 200000,
        "fifthInstallment": 200000,
        "sixthInstallment": 0,
        "totalReceived": 1000000,
        "remaining": 0
    },
    "monthly-expenses": {
        "year": "2025",
        "month": "7",
        "staffSalary": 50000,
        "expenses": 10000,
        "buildingRent": 5000,
        "dramaFee": 0,
        "socialSupport": 0,
        "electricity": 2000,
        "total": 67000,
        "notes": "Test expense"
    },
    "daily-accounts": {
        "number": 1,
        "week": "W/1",
        "purpose": "Test Purpose",
        "checkNumber": "C001",
        "amount": 100000
    }
}

async def test_endpoints():
    base_url = "http://localhost:8001/api"
    
    print("🚀 Testing MongoDB connection for all 7 modules...")
    
    results = {}
    
    for endpoint, data in test_data.items():
        try:
            print(f"\n📋 Testing {endpoint}...")
            
            # POST test data
            response = requests.post(f"{base_url}/{endpoint}", json=data)
            if response.status_code == 200:
                print(f"✅ Created {endpoint} entry successfully")
                created_id = response.json().get('id')
                
                # GET test
                get_response = requests.get(f"{base_url}/{endpoint}")
                if get_response.status_code == 200:
                    entries = get_response.json()
                    print(f"✅ Retrieved {len(entries)} {endpoint} entries from MongoDB")
                    results[endpoint] = {"created": True, "retrieved": len(entries)}
                else:
                    print(f"❌ Failed to retrieve {endpoint} entries")
                    results[endpoint] = {"created": True, "retrieved": 0}
            else:
                print(f"❌ Failed to create {endpoint} entry: {response.status_code}")
                print(f"Response: {response.text}")
                results[endpoint] = {"created": False, "retrieved": 0}
                
        except Exception as e:
            print(f"❌ Error testing {endpoint}: {e}")
            results[endpoint] = {"created": False, "retrieved": 0}
    
    print("\n📊 SUMMARY:")
    print("=" * 50)
    all_working = True
    for endpoint, result in results.items():
        status = "✅ WORKING" if result["created"] and result["retrieved"] > 0 else "❌ FAILED"
        print(f"{endpoint}: {status} (Entries: {result['retrieved']})")
        if not (result["created"] and result["retrieved"] > 0):
            all_working = False
    
    print("\n🎯 OVERALL STATUS:")
    if all_working:
        print("✅ ALL 7 MODULES SUCCESSFULLY CONNECTED TO MONGODB!")
    else:
        print("❌ Some modules failed to connect to MongoDB")
    
    return results

if __name__ == "__main__":
    asyncio.run(test_endpoints())