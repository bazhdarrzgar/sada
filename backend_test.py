#!/usr/bin/env python3
"""
Backend API Test Suite for Next.js Berdoz Management System
Tests all API endpoints that were migrated from FastAPI to Next.js
"""

import requests
import json
import uuid
import sys
from datetime import datetime
from typing import Dict, Any, Optional

class BerdozAPITester:
    def __init__(self, base_url: str = "http://localhost:3000"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.test_results = []
        self.created_records = {
            'calendar': [],
            'legend': [],
            'staff': []
        }
        
    def log_test(self, test_name: str, success: bool, message: str = "", response_data: Any = None):
        """Log test results"""
        result = {
            'test': test_name,
            'success': success,
            'message': message,
            'timestamp': datetime.now().isoformat()
        }
        if response_data:
            result['response'] = response_data
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if message:
            print(f"    {message}")
        if not success and response_data:
            print(f"    Response: {response_data}")
        print()

    def make_request(self, method: str, endpoint: str, data: Dict = None, params: Dict = None) -> tuple:
        """Make HTTP request and return (success, response_data, status_code)"""
        url = f"{self.api_url}{endpoint}"
        try:
            if method == 'GET':
                response = requests.get(url, params=params, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, timeout=10)
            else:
                return False, f"Unsupported method: {method}", 400
                
            try:
                response_data = response.json()
            except:
                response_data = response.text
                
            return response.status_code < 400, response_data, response.status_code
            
        except requests.exceptions.ConnectionError:
            return False, "Connection refused - server may not be running", 0
        except requests.exceptions.Timeout:
            return False, "Request timeout", 0
        except Exception as e:
            return False, f"Request error: {str(e)}", 0

    def test_main_api(self):
        """Test main API endpoint"""
        success, data, status = self.make_request('GET', '')
        
        if success and isinstance(data, dict):
            expected_endpoints = ['calendar', 'legend', 'staff']
            has_endpoints = 'endpoints' in data
            has_message = 'message' in data
            
            if has_endpoints and has_message:
                self.log_test("Main API Info", True, f"API info retrieved successfully")
                return True
            else:
                self.log_test("Main API Info", False, f"Missing expected fields in response", data)
                return False
        else:
            self.log_test("Main API Info", False, f"Failed to get API info (Status: {status})", data)
            return False

    def test_calendar_endpoints(self):
        """Test all calendar endpoints"""
        results = []
        
        # Test GET all calendars (empty initially)
        success, data, status = self.make_request('GET', '/calendar')
        results.append(success)
        if success:
            self.log_test("Calendar GET All", True, f"Retrieved {len(data)} calendar entries")
        else:
            self.log_test("Calendar GET All", False, f"Failed to get calendars (Status: {status})", data)
            
        # Test POST create calendar
        calendar_data = {
            "month": "January",
            "year": 2024,
            "week1": ["Math", "Science", "English", "History", "PE"],
            "week2": ["Math", "Science", "English", "History", "Art"],
            "week3": ["Math", "Science", "English", "History", "Music"],
            "week4": ["Math", "Science", "English", "History", "PE"]
        }
        
        success, data, status = self.make_request('POST', '/calendar', calendar_data)
        results.append(success)
        if success and 'id' in data:
            calendar_id = data['id']
            self.created_records['calendar'].append(calendar_id)
            self.log_test("Calendar POST Create", True, f"Created calendar with ID: {calendar_id}")
            
            # Test GET specific calendar
            success, data, status = self.make_request('GET', f'/calendar/{calendar_id}')
            results.append(success)
            if success:
                self.log_test("Calendar GET Specific", True, f"Retrieved calendar {calendar_id}")
                
                # Test PUT update calendar
                update_data = {"month": "February", "year": 2024}
                success, data, status = self.make_request('PUT', f'/calendar/{calendar_id}', update_data)
                results.append(success)
                if success:
                    self.log_test("Calendar PUT Update", True, f"Updated calendar {calendar_id}")
                else:
                    self.log_test("Calendar PUT Update", False, f"Failed to update calendar (Status: {status})", data)
            else:
                self.log_test("Calendar GET Specific", False, f"Failed to get calendar {calendar_id} (Status: {status})", data)
                results.append(False)
        else:
            self.log_test("Calendar POST Create", False, f"Failed to create calendar (Status: {status})", data)
            results.append(False)
            results.append(False)
            
        return all(results)

    def test_legend_endpoints(self):
        """Test all legend endpoints"""
        results = []
        
        # Test GET all legends
        success, data, status = self.make_request('GET', '/legend')
        results.append(success)
        if success:
            self.log_test("Legend GET All", True, f"Retrieved {len(data)} legend entries")
        else:
            self.log_test("Legend GET All", False, f"Failed to get legends (Status: {status})", data)
            
        # Test POST create legend
        legend_data = {
            "abbreviation": "MATH",
            "full_description": "Mathematics Course",
            "category": "Academic"
        }
        
        success, data, status = self.make_request('POST', '/legend', legend_data)
        results.append(success)
        if success and 'id' in data:
            legend_id = data['id']
            self.created_records['legend'].append(legend_id)
            self.log_test("Legend POST Create", True, f"Created legend with ID: {legend_id}")
            
            # Test GET specific legend
            success, data, status = self.make_request('GET', f'/legend/{legend_id}')
            results.append(success)
            if success:
                self.log_test("Legend GET Specific", True, f"Retrieved legend {legend_id}")
                
                # Test PUT update legend
                update_data = {"full_description": "Advanced Mathematics Course"}
                success, data, status = self.make_request('PUT', f'/legend/{legend_id}', update_data)
                results.append(success)
                if success:
                    self.log_test("Legend PUT Update", True, f"Updated legend {legend_id}")
                else:
                    self.log_test("Legend PUT Update", False, f"Failed to update legend (Status: {status})", data)
            else:
                self.log_test("Legend GET Specific", False, f"Failed to get legend {legend_id} (Status: {status})", data)
                results.append(False)
        else:
            self.log_test("Legend POST Create", False, f"Failed to create legend (Status: {status})", data)
            results.append(False)
            results.append(False)
            
        return all(results)

    def test_staff_endpoints(self):
        """Test all staff endpoints"""
        results = []
        
        # Test GET all staff
        success, data, status = self.make_request('GET', '/staff')
        results.append(success)
        if success:
            self.log_test("Staff GET All", True, f"Retrieved {len(data)} تۆمارەکانی ستاف")
        else:
            self.log_test("Staff GET All", False, f"Failed to get staff (Status: {status})", data)
            
        # Test POST create staff
        staff_data = {
            "fullName": "Ahmad Hassan",
            "mobile": "07501234567",
            "address": "Erbil, Kurdistan",
            "gender": "Male",
            "dateOfBirth": "1985-05-15",
            "certificate": "Bachelor's Degree",
            "age": 38,
            "education": "Computer Science",
            "attendance": "Present",
            "department": "IT Department",
            "pass_grade": "A",
            "contract": "Permanent"
        }
        
        success, data, status = self.make_request('POST', '/staff', staff_data)
        results.append(success)
        if success and 'id' in data:
            staff_id = data['id']
            self.created_records['staff'].append(staff_id)
            self.log_test("Staff POST Create", True, f"Created staff with ID: {staff_id}")
            
            # Test GET specific staff
            success, data, status = self.make_request('GET', f'/staff/{staff_id}')
            results.append(success)
            if success:
                self.log_test("Staff GET Specific", True, f"Retrieved staff {staff_id}")
                
                # Test PUT update staff
                update_data = {"department": "Engineering Department", "pass_grade": "A+"}
                success, data, status = self.make_request('PUT', f'/staff/{staff_id}', update_data)
                results.append(success)
                if success:
                    self.log_test("Staff PUT Update", True, f"Updated staff {staff_id}")
                else:
                    self.log_test("Staff PUT Update", False, f"Failed to update staff (Status: {status})", data)
            else:
                self.log_test("Staff GET Specific", False, f"Failed to get staff {staff_id} (Status: {status})", data)
                results.append(False)
        else:
            self.log_test("Staff POST Create", False, f"Failed to create staff (Status: {status})", data)
            results.append(False)
            results.append(False)
            
        return all(results)

    def test_delete_operations(self):
        """Test DELETE operations for all created records"""
        results = []
        
        # Delete calendar entries
        for calendar_id in self.created_records['calendar']:
            success, data, status = self.make_request('DELETE', f'/calendar/{calendar_id}')
            results.append(success)
            if success:
                self.log_test("Calendar DELETE", True, f"Deleted calendar {calendar_id}")
            else:
                self.log_test("Calendar DELETE", False, f"Failed to delete calendar {calendar_id} (Status: {status})", data)
                
        # Delete legend entries
        for legend_id in self.created_records['legend']:
            success, data, status = self.make_request('DELETE', f'/legend/{legend_id}')
            results.append(success)
            if success:
                self.log_test("Legend DELETE", True, f"Deleted legend {legend_id}")
            else:
                self.log_test("Legend DELETE", False, f"Failed to delete legend {legend_id} (Status: {status})", data)
                
        # Delete تۆمارەکانی ستاف
        for staff_id in self.created_records['staff']:
            success, data, status = self.make_request('DELETE', f'/staff/{staff_id}')
            results.append(success)
            if success:
                self.log_test("Staff DELETE", True, f"Deleted staff {staff_id}")
            else:
                self.log_test("Staff DELETE", False, f"Failed to delete staff {staff_id} (Status: {status})", data)
                
        # Delete payroll records
        for payroll_id in self.created_records['payroll']:
            success, data, status = self.make_request('DELETE', f'/payroll/{payroll_id}')
            results.append(success)
            if success:
                self.log_test("Payroll DELETE", True, f"Deleted payroll {payroll_id}")
            else:
                self.log_test("Payroll DELETE", False, f"Failed to delete payroll {payroll_id} (Status: {status})", data)
                
        # Delete teacher supervision records
        for teacher_supervision_id in self.created_records['teacher_supervision']:
            success, data, status = self.make_request('DELETE', f'/supervision/teacher/{teacher_supervision_id}')
            results.append(success)
            if success:
                self.log_test("Teacher Supervision DELETE", True, f"Deleted teacher supervision {teacher_supervision_id}")
            else:
                self.log_test("Teacher Supervision DELETE", False, f"Failed to delete teacher supervision {teacher_supervision_id} (Status: {status})", data)
                
        # Delete student supervision records
        for student_supervision_id in self.created_records['student_supervision']:
            success, data, status = self.make_request('DELETE', f'/supervision/student/{student_supervision_id}')
            results.append(success)
            if success:
                self.log_test("Student Supervision DELETE", True, f"Deleted student supervision {student_supervision_id}")
            else:
                self.log_test("Student Supervision DELETE", False, f"Failed to delete student supervision {student_supervision_id} (Status: {status})", data)
                
        return all(results)

    def test_error_handling(self):
        """Test error handling for invalid requests"""
        results = []
        
        # Test GET non-existent records
        fake_id = str(uuid.uuid4())
        
        endpoints_to_test = [
            f'/calendar/{fake_id}',
            f'/legend/{fake_id}',
            f'/staff/{fake_id}',
            f'/payroll/{fake_id}',
            f'/supervision/teacher/{fake_id}',
            f'/supervision/student/{fake_id}'
        ]
        
        for endpoint in endpoints_to_test:
            success, data, status = self.make_request('GET', endpoint)
            # We expect this to fail with 404
            if status == 404:
                results.append(True)
                self.log_test(f"Error Handling GET {endpoint}", True, "Correctly returned 404 for non-existent record")
            else:
                results.append(False)
                self.log_test(f"Error Handling GET {endpoint}", False, f"Expected 404, got {status}", data)
                
        return all(results)

    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting Berdoz Management System API Tests")
        print("=" * 60)
        
        test_suites = [
            ("Main API", self.test_main_api),
            ("Calendar Endpoints", self.test_calendar_endpoints),
            ("Legend Endpoints", self.test_legend_endpoints),
            ("Staff Endpoints", self.test_staff_endpoints),
            ("Payroll Endpoints", self.test_payroll_endpoints),
            ("Teacher Supervision Endpoints", self.test_teacher_supervision_endpoints),
            ("Student Supervision Endpoints", self.test_student_supervision_endpoints),
            ("Delete Operations", self.test_delete_operations),
            ("Error Handling", self.test_error_handling)
        ]
        
        suite_results = []
        for suite_name, test_func in test_suites:
            print(f"\n📋 Testing {suite_name}")
            print("-" * 40)
            result = test_func()
            suite_results.append((suite_name, result))
            
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed_suites = 0
        total_tests = len(self.test_results)
        passed_tests = sum(1 for test in self.test_results if test['success'])
        
        for suite_name, result in suite_results:
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{status}: {suite_name}")
            if result:
                passed_suites += 1
                
        print(f"\nOverall Results:")
        print(f"Test Suites: {passed_suites}/{len(suite_results)} passed")
        print(f"Individual Tests: {passed_tests}/{total_tests} passed")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if passed_suites == len(suite_results):
            print("\n🎉 All test suites passed! The Next.js API migration is working correctly.")
            return True
        else:
            print(f"\n⚠️  {len(suite_results) - passed_suites} test suite(s) failed. Check the logs above for details.")
            return False

def main():
    """Main function to run tests"""
    import os
    
    # Get base URL from environment or use default
    base_url = os.getenv('NEXT_PUBLIC_API_URL', 'http://localhost:3000')
    
    print(f"Testing API at: {base_url}")
    
    tester = BerdozAPITester(base_url)
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()