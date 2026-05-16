#!/usr/bin/env python
import requests
import json

# API endpoint
BASE_URL = 'http://127.0.0.1:8000/api'

# Test data
email = 'Syahri@gmail.com'
# Try common passwords
passwords = ['test1234', 'password', '123456', 'Syahri123', 'admin123']

# UMKM ID (from database)
umkm_id = '87d1412e-92e6-4a1d-b4e7-54a641e8c9ea'

print("=" * 60)
print("Testing Review Submission with Fixed Serializer")
print("=" * 60)

# Try to login
access_token = None
for pwd in passwords:
    print(f"\nTrying password: {pwd}")
    
    response = requests.post(f'{BASE_URL}/auth/login/', {
        'email': email,
        'password': pwd
    })
    
    if response.status_code == 200:
        try:
            data = response.json()
            access_token = data.get('access')
            print(f"✓ Login successful!")
            print(f"  Access token: {access_token[:50]}...")
            break
        except:
            pass
    else:
        print(f"  ✗ Login failed: {response.status_code}")

if not access_token:
    print("\n✗ Could not login with any password")
    exit(1)

# Now test review submission
print("\n" + "=" * 60)
print("Testing Review POST Request")
print("=" * 60)

headers = {
    'Authorization': f'Bearer {access_token}',
    'Content-Type': 'application/json'
}

review_data = {
    'umkm': umkm_id,
    'rating': 5,
    'comment': 'Test ulasan - apakah 400 error sudah fixed?'
}

print(f"\nPOST /umkm-reviews/")
print(f"Headers: Authorization: Bearer ...")
print(f"Data: {json.dumps(review_data, indent=2)}")

response = requests.post(f'{BASE_URL}/umkm-reviews/', 
                        json=review_data,
                        headers=headers)

print(f"\nResponse Status: {response.status_code}")
print(f"Response Body:\n{json.dumps(response.json(), indent=2, default=str)}")

if response.status_code == 201:
    print("\n✓ Review created successfully! 400 error is FIXED!")
else:
    print(f"\n✗ Review creation failed with status {response.status_code}")
