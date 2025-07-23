#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Iowa Dashboard
Tests authentication, house prices, and social features APIs
"""

import requests
import json
import base64
import time
from datetime import datetime
import uuid

# Configuration
BASE_URL = "https://c4cbe737-f38a-40b8-bb2a-38fbad0de43d.preview.emergentagent.com/api"
TIMEOUT = 30

class IowaBackendTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.session.timeout = TIMEOUT
        self.auth_token = None
        self.test_user_id = None
        self.test_post_id = None
        
        # Test data
        self.test_email = "sarah.johnson@email.com"
        self.test_phone = "+15551234567"
        self.test_password = "SecurePass123!"
        self.test_name = "Sarah Johnson"
        
        print(f"🚀 Starting Iowa Dashboard Backend API Tests")
        print(f"📍 Base URL: {self.base_url}")
        print("=" * 60)

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        print("\n🔍 Testing Root Endpoint...")
        try:
            response = self.session.get(f"{self.base_url}/")
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Root endpoint working: {data.get('message', 'No message')}")
                return True
            else:
                print(f"❌ Root endpoint failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Root endpoint error: {str(e)}")
            return False

    def test_user_registration(self):
        """Test user registration with email and phone"""
        print("\n🔍 Testing User Registration...")
        
        # Test registration with email
        registration_data = {
            "email": self.test_email,
            "password": self.test_password,
            "name": self.test_name
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/auth/register",
                json=registration_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data.get("access_token")
                self.test_user_id = data.get("user", {}).get("id")
                print(f"✅ User registration successful")
                print(f"   User ID: {self.test_user_id}")
                print(f"   Token received: {'Yes' if self.auth_token else 'No'}")
                return True
            elif response.status_code == 400 and "already exists" in response.text:
                print("⚠️  User already exists, trying login instead...")
                return self.test_user_login()
            else:
                print(f"❌ Registration failed: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Registration error: {str(e)}")
            return False

    def test_user_login(self):
        """Test user login with email/phone"""
        print("\n🔍 Testing User Login...")
        
        login_data = {
            "email_or_phone": self.test_email,
            "password": self.test_password
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/auth/login",
                json=login_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data.get("access_token")
                self.test_user_id = data.get("user", {}).get("id")
                print(f"✅ User login successful")
                print(f"   User ID: {self.test_user_id}")
                print(f"   Token received: {'Yes' if self.auth_token else 'No'}")
                return True
            else:
                print(f"❌ Login failed: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Login error: {str(e)}")
            return False

    def test_protected_route_access(self):
        """Test accessing protected routes with JWT token"""
        print("\n🔍 Testing Protected Route Access...")
        
        if not self.auth_token:
            print("❌ No auth token available for testing")
            return False
            
        headers = {
            "Authorization": f"Bearer {self.auth_token}",
            "Content-Type": "application/json"
        }
        
        try:
            response = self.session.get(f"{self.base_url}/auth/me", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Protected route access successful")
                print(f"   User: {data.get('name', 'Unknown')}")
                print(f"   Email: {data.get('email', 'N/A')}")
                return True
            else:
                print(f"❌ Protected route access failed: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Protected route error: {str(e)}")
            return False

    def test_house_prices_seed(self):
        """Test seeding house price data"""
        print("\n🔍 Testing House Prices Seed...")
        
        try:
            response = self.session.post(f"{self.base_url}/house-prices/seed")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ House prices seeded successfully")
                print(f"   Message: {data.get('message', 'No message')}")
                return True
            else:
                print(f"❌ House prices seed failed: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ House prices seed error: {str(e)}")
            return False

    def test_house_prices_get(self):
        """Test getting house price data"""
        print("\n🔍 Testing House Prices GET...")
        
        try:
            response = self.session.get(f"{self.base_url}/house-prices")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ House prices retrieved successfully")
                print(f"   Total records: {len(data)}")
                
                if len(data) > 0:
                    sample = data[0]
                    print(f"   Sample city: {sample.get('city', 'Unknown')}")
                    print(f"   Sample price: ${sample.get('avg_price', 0):,}")
                    print(f"   Has coordinates: {'Yes' if sample.get('latitude') and sample.get('longitude') else 'No'}")
                
                # Verify Iowa cities are present
                iowa_cities = [item['city'] for item in data if 'Des Moines' in item.get('city', '') or 'Cedar Rapids' in item.get('city', '')]
                if iowa_cities:
                    print(f"   Iowa cities found: {len(iowa_cities)}")
                
                return True
            else:
                print(f"❌ House prices GET failed: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ House prices GET error: {str(e)}")
            return False

    def test_create_post(self):
        """Test creating a post (authenticated users only)"""
        print("\n🔍 Testing Create Post...")
        
        if not self.auth_token:
            print("❌ No auth token available for testing")
            return False
            
        headers = {
            "Authorization": f"Bearer {self.auth_token}",
            "Content-Type": "application/json"
        }
        
        # Create a simple base64 image for testing
        test_image_data = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        
        post_data = {
            "content": "Just moved to Iowa! Loving the house prices here compared to California. Des Moines seems like a great place to settle down. 🏠 #Iowa #RealEstate",
            "image": test_image_data
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/posts",
                json=post_data,
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                self.test_post_id = data.get("id")
                print(f"✅ Post created successfully")
                print(f"   Post ID: {self.test_post_id}")
                print(f"   Content: {data.get('content', '')[:50]}...")
                print(f"   Has image: {'Yes' if data.get('image') else 'No'}")
                print(f"   Author: {data.get('user', {}).get('name', 'Unknown')}")
                return True
            else:
                print(f"❌ Post creation failed: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Post creation error: {str(e)}")
            return False

    def test_get_posts(self):
        """Test fetching posts with user information"""
        print("\n🔍 Testing Get Posts...")
        
        try:
            response = self.session.get(f"{self.base_url}/posts")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Posts retrieved successfully")
                print(f"   Total posts: {len(data)}")
                
                if len(data) > 0:
                    sample = data[0]
                    print(f"   Sample post content: {sample.get('content', '')[:50]}...")
                    print(f"   Sample author: {sample.get('user', {}).get('name', 'Unknown')}")
                    print(f"   Sample likes: {sample.get('likes', 0)}")
                    print(f"   Has user info: {'Yes' if sample.get('user') else 'No'}")
                
                return True
            else:
                print(f"❌ Get posts failed: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Get posts error: {str(e)}")
            return False

    def test_like_unlike_post(self):
        """Test like/unlike functionality"""
        print("\n🔍 Testing Like/Unlike Post...")
        
        if not self.auth_token or not self.test_post_id:
            print("❌ No auth token or post ID available for testing")
            return False
            
        headers = {
            "Authorization": f"Bearer {self.auth_token}",
            "Content-Type": "application/json"
        }
        
        try:
            # Test liking a post
            response = self.session.post(
                f"{self.base_url}/posts/{self.test_post_id}/like",
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                liked_status = data.get("liked", False)
                print(f"✅ Like action successful")
                print(f"   Post liked: {liked_status}")
                
                # Test unliking the same post
                response2 = self.session.post(
                    f"{self.base_url}/posts/{self.test_post_id}/like",
                    headers=headers
                )
                
                if response2.status_code == 200:
                    data2 = response2.json()
                    unliked_status = data2.get("liked", True)
                    print(f"✅ Unlike action successful")
                    print(f"   Post liked after second click: {unliked_status}")
                    return True
                else:
                    print(f"❌ Unlike action failed: {response2.status_code}")
                    return False
            else:
                print(f"❌ Like action failed: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Like/unlike error: {str(e)}")
            return False

    def test_error_handling(self):
        """Test error handling for invalid inputs"""
        print("\n🔍 Testing Error Handling...")
        
        tests_passed = 0
        total_tests = 0
        
        # Test invalid registration
        total_tests += 1
        try:
            invalid_registration = {
                "email": "invalid-email",
                "password": "123",
                "name": ""
            }
            response = self.session.post(
                f"{self.base_url}/auth/register",
                json=invalid_registration
            )
            if response.status_code == 400:
                print("✅ Invalid registration properly rejected")
                tests_passed += 1
            else:
                print(f"❌ Invalid registration not properly handled: {response.status_code}")
        except Exception as e:
            print(f"❌ Error testing invalid registration: {str(e)}")
        
        # Test invalid login
        total_tests += 1
        try:
            invalid_login = {
                "email_or_phone": "nonexistent@email.com",
                "password": "wrongpassword"
            }
            response = self.session.post(
                f"{self.base_url}/auth/login",
                json=invalid_login
            )
            if response.status_code == 401:
                print("✅ Invalid login properly rejected")
                tests_passed += 1
            else:
                print(f"❌ Invalid login not properly handled: {response.status_code}")
        except Exception as e:
            print(f"❌ Error testing invalid login: {str(e)}")
        
        # Test unauthorized access
        total_tests += 1
        try:
            response = self.session.get(f"{self.base_url}/auth/me")
            if response.status_code == 401 or response.status_code == 403:
                print("✅ Unauthorized access properly rejected")
                tests_passed += 1
            else:
                print(f"❌ Unauthorized access not properly handled: {response.status_code}")
        except Exception as e:
            print(f"❌ Error testing unauthorized access: {str(e)}")
        
        print(f"   Error handling tests passed: {tests_passed}/{total_tests}")
        return tests_passed == total_tests

    def run_all_tests(self):
        """Run all backend API tests"""
        print(f"\n🧪 Running Comprehensive Backend API Tests")
        print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        test_results = {}
        
        # Test sequence
        tests = [
            ("Root Endpoint", self.test_root_endpoint),
            ("User Registration", self.test_user_registration),
            ("Protected Route Access", self.test_protected_route_access),
            ("House Prices Seed", self.test_house_prices_seed),
            ("House Prices GET", self.test_house_prices_get),
            ("Create Post", self.test_create_post),
            ("Get Posts", self.test_get_posts),
            ("Like/Unlike Post", self.test_like_unlike_post),
            ("Error Handling", self.test_error_handling),
        ]
        
        for test_name, test_func in tests:
            try:
                result = test_func()
                test_results[test_name] = result
                time.sleep(1)  # Brief pause between tests
            except Exception as e:
                print(f"❌ {test_name} failed with exception: {str(e)}")
                test_results[test_name] = False
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in test_results.values() if result)
        total = len(test_results)
        
        for test_name, result in test_results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{status} {test_name}")
        
        print(f"\n🎯 Overall Result: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All backend API tests PASSED! The Iowa Dashboard backend is working correctly.")
        else:
            print("⚠️  Some tests failed. Please check the detailed output above.")
        
        print(f"⏰ Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        return test_results

if __name__ == "__main__":
    tester = IowaBackendTester()
    results = tester.run_all_tests()