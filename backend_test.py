#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime, timedelta
import uuid

class DailyAccountsAPITester:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.created_entries = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if method == 'GET' and isinstance(response_data, list):
                        print(f"   Retrieved {len(response_data)} records")
                    elif method == 'POST' and 'id' in response_data:
                        print(f"   Created entry with ID: {response_data['id']}")
                        self.created_entries.append(response_data['id'])
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Response: {response.text}")
                return False, {}

        except requests.exceptions.ConnectionError:
            print(f"❌ Failed - Connection Error: Could not connect to {url}")
            return False, {}
        except requests.exceptions.Timeout:
            print(f"❌ Failed - Timeout: Request took too long")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_get_daily_accounts(self):
        """Test GET /api/daily-accounts"""
        success, data = self.run_test(
            "Get Daily Accounts",
            "GET",
            "api/daily-accounts",
            200
        )
        if success:
            print(f"   Found {len(data)} daily account records")
            if len(data) > 0:
                sample = data[0]
                required_fields = ['id', 'number', 'purpose', 'amount', 'date']
                missing_fields = [field for field in required_fields if field not in sample]
                if missing_fields:
                    print(f"   ⚠️  Missing fields in response: {missing_fields}")
                else:
                    print(f"   ✅ All required fields present")
        return success, data

    def test_create_daily_account(self):
        """Test POST /api/daily-accounts"""
        test_data = {
            "number": 999,
            "week": "W/TEST",
            "purpose": "تاقیکردنەوەی سیستەم - Test Entry",
            "checkNumber": "TEST001",
            "amount": 50000,
            "date": "2025-01-15",
            "notes": "This is a test entry created by automated testing"
        }
        
        success, response_data = self.run_test(
            "Create Daily Account",
            "POST",
            "api/daily-accounts",
            200,
            data=test_data
        )
        
        if success and 'id' in response_data:
            # Verify the created data matches what we sent
            for key, value in test_data.items():
                if key in response_data and response_data[key] != value:
                    print(f"   ⚠️  Field mismatch - {key}: expected {value}, got {response_data[key]}")
            return success, response_data['id']
        return success, None

    def test_get_specific_daily_account(self, account_id):
        """Test GET /api/daily-accounts/[id]"""
        success, data = self.run_test(
            f"Get Specific Daily Account ({account_id})",
            "GET",
            f"api/daily-accounts/{account_id}",
            200
        )
        return success, data

    def test_update_daily_account(self, account_id):
        """Test PUT /api/daily-accounts/[id]"""
        update_data = {
            "number": 1000,
            "week": "W/UPDATED",
            "purpose": "نوێکراوەتەوە - Updated Test Entry",
            "checkNumber": "UPD001",
            "amount": 75000,
            "date": "2025-01-16",
            "notes": "This entry has been updated by automated testing"
        }
        
        success, data = self.run_test(
            f"Update Daily Account ({account_id})",
            "PUT",
            f"api/daily-accounts/{account_id}",
            200,
            data=update_data
        )
        return success, data

    def test_delete_daily_account(self, account_id):
        """Test DELETE /api/daily-accounts/[id]"""
        success, data = self.run_test(
            f"Delete Daily Account ({account_id})",
            "DELETE",
            f"api/daily-accounts/{account_id}",
            200
        )
        if success:
            # Remove from our tracking list
            if account_id in self.created_entries:
                self.created_entries.remove(account_id)
        return success, data

    def cleanup_test_entries(self):
        """Clean up any test entries that were created"""
        print(f"\n🧹 Cleaning up {len(self.created_entries)} test entries...")
        for entry_id in self.created_entries.copy():
            self.test_delete_daily_account(entry_id)

def main():
    print("🚀 Starting Daily Accounts API Tests...")
    print("=" * 50)
    
    # Test with localhost first, then try public URL if available
    tester = DailyAccountsAPITester("http://localhost:3000")
    
    try:
        # Test 1: Get all daily accounts
        success, existing_data = tester.test_get_daily_accounts()
        if not success:
            print("❌ Basic API connection failed. Stopping tests.")
            return 1

        # Test 2: Create a new daily account
        success, created_id = tester.test_create_daily_account()
        if not success or not created_id:
            print("❌ Failed to create daily account. Stopping tests.")
            return 1

        # Test 3: Get the specific daily account we just created
        success, retrieved_data = tester.test_get_specific_daily_account(created_id)
        if not success:
            print("❌ Failed to retrieve created daily account.")

        # Test 4: Update the daily account
        success, updated_data = tester.test_update_daily_account(created_id)
        if not success:
            print("❌ Failed to update daily account.")

        # Test 5: Verify the update worked by getting it again
        success, final_data = tester.test_get_specific_daily_account(created_id)
        if success and final_data.get('purpose') == "نوێکراوەتەوە - Updated Test Entry":
            print("✅ Update verification successful")
            tester.tests_passed += 1
        else:
            print("❌ Update verification failed")
        tester.tests_run += 1

        # Test 6: Test error handling - try to get non-existent record
        success, error_data = tester.run_test(
            "Get Non-existent Daily Account",
            "GET",
            "api/daily-accounts/non-existent-id",
            404
        )

        # Clean up test entries
        tester.cleanup_test_entries()

        # Final results
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} tests passed")
        
        if tester.tests_passed == tester.tests_run:
            print("🎉 All tests passed! Daily Accounts API is working correctly.")
            return 0
        else:
            print("⚠️  Some tests failed. Check the API implementation.")
            return 1

    except KeyboardInterrupt:
        print("\n⏹️  Tests interrupted by user")
        tester.cleanup_test_entries()
        return 1
    except Exception as e:
        print(f"\n💥 Unexpected error during testing: {str(e)}")
        tester.cleanup_test_entries()
        return 1

if __name__ == "__main__":
    sys.exit(main())