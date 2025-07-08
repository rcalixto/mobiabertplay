import requests
import unittest
import sys
import os
import json
import io
import base64
from PIL import Image
from datetime import datetime

# Get the backend URL from the frontend .env file
BACKEND_URL = "https://c5d6ee61-0e21-433f-b06e-02648f723da3.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"
ADMIN_TOKEN = "admin-radio-token-2025"

class RadioAPITester:
    def __init__(self):
        self.base_url = API_BASE
        self.admin_token = ADMIN_TOKEN
        self.tests_run = 0
        self.tests_passed = 0
        self.test_radio_id = None
        self.uploaded_logo_url = None

    def run_test(self, name, method, endpoint, expected_status, data=None, auth=False, print_response=False, files=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {}
        if not files:  # Don't set Content-Type for multipart/form-data (file uploads)
            headers['Content-Type'] = 'application/json'
        if auth:
            headers['Authorization'] = f'Bearer {self.admin_token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    response = requests.post(url, files=files, headers=headers)
                else:
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
            
    def create_test_image(self, filename="test_logo.png", size=(200, 200), color=(255, 0, 0)):
        """Create a test image for logo upload testing"""
        img = Image.new('RGB', size, color=color)
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        return img_byte_arr.getvalue(), filename

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

    def test_get_customization(self):
        """Test getting platform customization settings"""
        return self.run_test("Get Customization Settings", "GET", "customization", 200, print_response=True)
        
    def test_update_customization(self):
        """Test updating platform customization settings (admin only)"""
        update_data = {
            "colors": {
                "primary": "#FF5733",
                "secondary": "#33FF57",
                "accent": "#3357FF",
                "background": "#F5F5F5",
                "text": "#333333"
            },
            "texts": {
                "platform_name": "mobinabert PLAY Test",
                "platform_slogan": "Testing customization API",
                "hero_title": "🎧 mobinabert PLAY Test",
                "hero_subtitle": "Testing customization API subtitle",
                "footer_text": "© 2025 mobinabert PLAY Test - All rights reserved"
            },
            "theme_name": "test_theme"
        }
        
        return self.run_test("Update Customization Settings", "PUT", "customization", 200, data=update_data, auth=True, print_response=True)
        
    def test_upload_platform_logo_with_auth(self):
        """Test uploading platform logo with admin authentication"""
        # Create a test image
        img_data, filename = self.create_test_image()
        
        # Create files dictionary for requests
        files = {'file': (filename, img_data, 'image/png')}
        
        # Send request with admin token
        success, response = self.run_test(
            "Upload Platform Logo (with auth)", 
            "POST", 
            "customization/logo", 
            200, 
            auth=True, 
            files=files,
            print_response=True
        )
        
        if success and response:
            self.uploaded_logo_url = response.get('logo_url')
            print(f"Uploaded logo URL: {self.uploaded_logo_url}")
        
        return success, response
        
    def test_upload_platform_logo_without_auth(self):
        """Test uploading platform logo without admin authentication (should fail)"""
        # Create a test image
        img_data, filename = self.create_test_image()
        
        # Create files dictionary for requests
        files = {'file': (filename, img_data, 'image/png')}
        
        # Send request without admin token (should fail with 401)
        return self.run_test(
            "Upload Platform Logo (without auth)", 
            "POST", 
            "customization/logo", 
            401, 
            auth=False, 
            files=files
        )
        
    def test_upload_platform_logo_invalid_file(self):
        """Test uploading invalid file type as platform logo (should fail)"""
        # Create a text file instead of an image
        text_data = b"This is not an image file"
        
        # Create files dictionary for requests
        files = {'file': ('test.txt', text_data, 'text/plain')}
        
        # Send request with admin token (should fail with 400)
        return self.run_test(
            "Upload Platform Logo (invalid file type)", 
            "POST", 
            "customization/logo", 
            400, 
            auth=True, 
            files=files
        )
        
    def test_verify_customization_persistence(self):
        """Test that customization changes persist in the database"""
        # First get current customization
        success, before = self.run_test("Get Customization Before Update", "GET", "customization", 200)
        if not success:
            return False, {}
            
        # Update with new values
        update_data = {
            "colors": {
                "primary": "#9900CC",
                "secondary": "#CC9900"
            },
            "texts": {
                "platform_name": f"mobinabert PLAY Persistence Test {datetime.now().strftime('%H:%M:%S')}"
            }
        }
        
        success, _ = self.run_test("Update Customization for Persistence Test", "PUT", "customization", 200, data=update_data, auth=True)
        if not success:
            return False, {}
            
        # Get updated customization
        success, after = self.run_test("Get Customization After Update", "GET", "customization", 200)
        if not success:
            return False, {}
            
        # Verify changes were applied
        if (after.get('colors', {}).get('primary') == update_data['colors']['primary'] and
            after.get('texts', {}).get('platform_name') == update_data['texts']['platform_name']):
            print("✅ Customization persistence verified - changes were saved correctly")
            return True, after
        else:
            print("❌ Customization persistence failed - changes were not saved correctly")
            print(f"Expected: {update_data}")
            print(f"Got: {after}")
            return False, after

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
        
        # Customization endpoints
        self.test_get_customization()
        self.test_update_customization()
        self.test_verify_customization_persistence()
        
        # Logo upload tests
        self.test_upload_platform_logo_without_auth()  # Should fail with 401
        self.test_upload_platform_logo_invalid_file()  # Should fail with 400
        self.test_upload_platform_logo_with_auth()     # Should succeed
        
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
        
    def run_customization_tests_only(self):
        """Run only customization and logo upload tests"""
        print("🚀 Starting Customization API Tests")
        print(f"Base URL: {self.base_url}")
        
        # Customization endpoints
        self.test_get_customization()
        self.test_update_customization()
        self.test_verify_customization_persistence()
        
        # Logo upload tests
        self.test_upload_platform_logo_without_auth()  # Should fail with 401
        self.test_upload_platform_logo_invalid_file()  # Should fail with 400
        self.test_upload_platform_logo_with_auth()     # Should succeed
        
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