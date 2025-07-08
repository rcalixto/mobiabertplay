import requests
import unittest
import sys
import os
import json
from datetime import datetime

# Get the backend URL from the frontend .env file
BACKEND_URL = "https://a4a715cc-5d19-4658-bab6-2453b972a4f6.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"
ADMIN_TOKEN = "admin-radio-token-2025"

class RadioAPITester:
    def __init__(self):
        self.base_url = API_BASE
        self.admin_token = ADMIN_TOKEN
        self.tests_run = 0
        self.tests_passed = 0
        self.test_radio_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, auth=False, print_response=False):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if auth:
            headers['Authorization'] = f'Bearer {self.admin_token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                if print_response:
                    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
                return True, response.json() if response.content else {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                if response.content:
                    print(f"Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_api_root(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_get_radios(self):
        """Test getting all radios"""
        return self.run_test("Get All Radios", "GET", "radios", 200, print_response=True)

    def test_search_radios(self):
        """Test searching radios"""
        return self.run_test("Search Radios (Jovem Pan)", "GET", "radios?busca=Jovem%20Pan", 200, print_response=True)

    def test_filter_radios_by_genre(self):
        """Test filtering radios by genre"""
        return self.run_test("Filter Radios by Genre", "GET", "radios?genero=Pop", 200)

    def test_filter_radios_by_region(self):
        """Test filtering radios by region"""
        return self.run_test("Filter Radios by Region", "GET", "radios?regiao=Sudeste", 200)

    def test_get_radio_by_id(self):
        """Test getting a radio by ID"""
        # First get all radios to find an ID
        success, radios = self.run_test("Get All Radios for ID", "GET", "radios", 200)
        if success and radios:
            radio_id = radios[0]['id']
            return self.run_test(f"Get Radio by ID ({radio_id})", "GET", f"radios/{radio_id}", 200, print_response=True)
        return False, {}

    def test_get_genres(self):
        """Test getting all genres"""
        return self.run_test("Get All Genres", "GET", "generos", 200, print_response=True)

    def test_get_regions(self):
        """Test getting all regions"""
        return self.run_test("Get All Regions", "GET", "regioes", 200, print_response=True)

    def test_get_stats(self):
        """Test getting platform stats"""
        return self.run_test("Get Platform Stats", "GET", "stats", 200, print_response=True)

    def test_create_radio(self):
        """Test creating a new radio (admin only)"""
        test_radio = {
            "nome": f"Test Radio {datetime.now().strftime('%Y%m%d%H%M%S')}",
            "descricao": "This is a test radio created by automated testing",
            "stream_url": "https://example.com/stream",
            "genero": "Pop",
            "regiao": "Sudeste",
            "cidade": "São Paulo",
            "estado": "SP",
            "endereco": "Av. Test, 123",
            "telefone": "(11) 1234-5678",
            "redes_sociais": {
                "facebook": "https://facebook.com/testradio",
                "instagram": "https://instagram.com/testradio",
                "website": "https://testradio.com"
            }
        }
        
        success, response = self.run_test("Create Radio", "POST", "radios", 200, data=test_radio, auth=True)
        if success and response:
            self.test_radio_id = response.get('id')
            print(f"Created test radio with ID: {self.test_radio_id}")
        return success, response

    def test_update_radio(self):
        """Test updating a radio (admin only)"""
        if not self.test_radio_id:
            print("❌ Cannot test update - no test radio ID available")
            return False, {}
            
        update_data = {
            "descricao": "Updated description from automated test",
            "genero": "Rock"
        }
        
        return self.run_test(f"Update Radio ({self.test_radio_id})", "PUT", f"radios/{self.test_radio_id}", 200, data=update_data, auth=True)

    def test_delete_radio(self):
        """Test deleting a radio (admin only)"""
        if not self.test_radio_id:
            print("❌ Cannot test delete - no test radio ID available")
            return False, {}
            
        return self.run_test(f"Delete Radio ({self.test_radio_id})", "DELETE", f"radios/{self.test_radio_id}", 200, auth=True)

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting API Tests for Radio Platform")
        print(f"Base URL: {self.base_url}")
        
        # Basic endpoints
        self.test_api_root()
        self.test_get_radios()
        self.test_search_radios()
        self.test_filter_radios_by_genre()
        self.test_filter_radios_by_region()
        self.test_get_radio_by_id()
        self.test_get_genres()
        self.test_get_regions()
        self.test_get_stats()
        
        # Admin endpoints
        self.test_create_radio()
        self.test_update_radio()
        self.test_delete_radio()
        
        # Print summary
        print("\n📊 Test Summary:")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed / self.tests_run) * 100:.2f}%")
        
        return self.tests_passed == self.tests_run

if __name__ == "__main__":
    tester = RadioAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)