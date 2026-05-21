# LoService API Endpoints - Complete Documentation
# Base URL: https://servpoint.my.id/api

## ============================================================
## AUTHENTICATION ENDPOINTS
## ============================================================

### 1. Register (User)
- **URL:** POST `https://servpoint.my.id/api/auth/register/`
- **Short URL:** POST `/api/auth/register/`
- **Body:**
{
  "email": "user@example.com",
  "password": "Password123!",
  "password_confirm": "Password123!",
  "role": "USER"
}
- **Response:** 201 Created
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "user_id": "uuid",
    "email": "user@example.com",
    "username": "user@example.com",
    "name": "user@example.com",
    "role": "USER"
  }
}

### 2. Register Owner (UMKM Owner)
- **URL:** POST `https://servpoint.my.id/api/auth/register-owner/`
- **Short URL:** POST `/api/auth/register-owner/`
- **Body:**
{
  "email": "owner@example.com",
  "password": "Password123!",
  "password_confirm": "Password123!",
  "role": "OWNER"
}
- **Response:** 201 Created (same structure as Register)

### 3. Login
- **URL:** POST `https://servpoint.my.id/api/auth/login/`
- **Short URL:** POST `/api/auth/login/`
- **Body:**
{
  "email": "user@example.com",
  "password": "Password123!"
}
- **Response:** 200 OK
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "user_id": "uuid",
    "email": "user@example.com",
    "username": "user@example.com",
    "name": "user@example.com",
    "role": "USER"
  }
}

### 4. Get Current User Info
- **URL:** GET `https://servpoint.my.id/api/auth/me/`
- **Short URL:** GET `/api/auth/me/`
- **Headers:** Authorization: Bearer {access_token}
- **Response:** 200 OK (User object)

### 5. Refresh Token
- **URL:** POST `https://servpoint.my.id/api/auth/token/refresh/`
- **Short URL:** POST `/api/auth/token/refresh/`
- **Body:**
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
- **Response:** 200 OK
{
  "access": "new_access_token",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}

## ============================================================
## USER ENDPOINTS
## ============================================================

### 6. Get Users List (Admin only)
- **URL:** GET `/api/users/`
- **Headers:** Authorization: Bearer {access_token}
- **Query Params:** 
  - role=USER|OWNER|ADMIN (filter by role)
  - q=name_or_email (search by name/email)
- **Response:** 200 OK
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "user_id": "uuid",
      "email": "user@example.com",
      "username": "user@example.com",
      "name": "User Name",
      "role": "USER",
      "profile_picture": null,
      "profile_picture_url": null,
      "is_staff": false,
      "is_superuser": false
    }
  ]
}

### 7. Get User Count by Role (Admin only)
- **URL:** GET `/api/users/count/`
- **Headers:** Authorization: Bearer {access_token}
- **Response:** 200 OK
{
  "total": 10,
  "by_role": {
    "ADMIN": 1,
    "OWNER": 3,
    "USER": 6
  }
}

### 8. Get User Detail (Self or Admin)
- **URL:** GET `/api/users/{user_id}/`
- **Headers:** Authorization: Bearer {access_token}
- **Response:** 200 OK (User object)

### 9. Update User Profile
- **URL:** PATCH `/api/users/{user_id}/`
- **Headers:** Authorization: Bearer {access_token}
- **Body:**
{
  "name": "New Name",
  "profile_picture": (file upload)
}
- **Response:** 200 OK (Updated User object)

### 10. Delete User Account
- **URL:** DELETE `/api/users/{user_id}/`
- **Headers:** Authorization: Bearer {access_token}
- **Response:** 204 No Content

## ============================================================
## KATEGORI ENDPOINTS (Product/Service Categories)
## ============================================================

### 11. Get All Categories
- **URL:** GET `/api/kategori/`
- **Query Params:** q=search_name
- **Response:** 200 OK
{
  "count": 10,
  "next": null,
  "previous": null,
  "results": [
    {
      "kategori_id": "uuid",
      "nama": "Laptop & Komputer",
      "deskripsi": "Perbaikan dan jual beli laptop",
      "icon": "icon_url"
    }
  ]
}

### 12. Create Category (Admin only)
- **URL:** POST `/api/kategori/`
- **Headers:** Authorization: Bearer {access_token}
- **Body:**
{
  "nama": "Smartphone",
  "deskripsi": "Perbaikan smartphone dan aksesoris"
}
- **Response:** 201 Created

### 13. Get Category Detail
- **URL:** GET `/api/kategori/{kategori_id}/`
- **Response:** 200 OK (Kategori object)

### 14. Update Category (Admin only)
- **URL:** PATCH `/api/kategori/{kategori_id}/`
- **Headers:** Authorization: Bearer {access_token}
- **Body:** (same as create)
- **Response:** 200 OK

### 15. Delete Category (Admin only)
- **URL:** DELETE `/api/kategori/{kategori_id}/`
- **Headers:** Authorization: Bearer {access_token}
- **Response:** 204 No Content

## ============================================================
## UMKM ENDPOINTS (Business/Shop Management)
## ============================================================

### 16. Get All UMKM (Filtered by Status & User)
- **URL:** GET `/api/umkm/`
- **Query Params:**
  - kategori=kategori_id
  - status=APPROVED|PENDING|REJECTED
  - q=search_name
- **Response:** 200 OK
{
  "count": 5,
  "results": [
    {
      "umkm_id": "uuid",
      "user": "uuid",
      "nama_umkm": "Service Laptop Jaya",
      "deskripsi": "Perbaikan dan upgrade laptop",
      "kategori": {kategori object},
      "status": "APPROVED",
      "verified_at": "2026-05-20T10:00:00Z",
      "branches": [
        {
          "branch_id": "uuid",
          "nama_branch": "Cabang Jakarta",
          "alamat": "Jl. Merdeka No. 123",
          "geom": {"type": "Point", "coordinates": [106.8456, -6.2088]},
          "operating_hours": {"Monday": "09:00-18:00"},
          "phone": "021-12345678"
        }
      ]
    }
  ]
}

### 17. Create UMKM (Owner only)
- **URL:** POST `/api/umkm/`
- **Headers:** Authorization: Bearer {access_token}
- **Body:**
{
  "nama_umkm": "Service Laptop Jaya",
  "deskripsi": "Perbaikan dan upgrade laptop",
  "kategori": "kategori_id",
  "branches": [
    {
      "nama_branch": "Cabang Jakarta",
      "alamat": "Jl. Merdeka No. 123",
      "geom": {"type": "Point", "coordinates": [106.8456, -6.2088]},
      "phone": "021-12345678",
      "operating_hours": {
        "Monday": "09:00-18:00",
        "Tuesday": "09:00-18:00"
      }
    }
  ]
}
- **Response:** 201 Created

### 18. Get UMKM Detail
- **URL:** GET `/api/umkm/{umkm_id}/`
- **Response:** 200 OK (UMKM object)

### 19. Update UMKM (Owner only)
- **URL:** PATCH `/api/umkm/{umkm_id}/`
- **Headers:** Authorization: Bearer {access_token}
- **Body:** (same as create)
- **Response:** 200 OK

### 20. Delete UMKM (Owner only)
- **URL:** DELETE `/api/umkm/{umkm_id}/`
- **Headers:** Authorization: Bearer {access_token}
- **Response:** 204 No Content

### 21. Approve UMKM (Admin only)
- **URL:** POST `/api/umkm/{umkm_id}/approve/`
- **Headers:** Authorization: Bearer {access_token}
- **Response:** 200 OK
{
  "detail": "UMKM telah diverifikasi"
}

### 22. Reject UMKM (Admin only)
- **URL:** POST `/api/umkm/{umkm_id}/reject/`
- **Headers:** Authorization: Bearer {access_token}
- **Body:**
{
  "alasan": "Informasi tidak lengkap"
}
- **Response:** 200 OK
{
  "detail": "UMKM ditolak"
}

## ============================================================
## UMKM SERVICE ENDPOINTS
## ============================================================

### 23. Get Services List
- **URL:** GET `/api/umkm-services/`
- **Query Params:** umkm_id=umkm_id
- **Response:** 200 OK (List of services)

### 24. Create Service (Owner only)
- **URL:** POST `/api/umkm-services/`
- **Headers:** Authorization: Bearer {access_token}
- **Body:**
{
  "umkm": "umkm_id",
  "nama_service": "Upgrade RAM",
  "deskripsi": "Upgrade RAM 8GB menjadi 16GB",
  "harga": 500000
}
- **Response:** 201 Created

### 25. Get Service Detail
- **URL:** GET `/api/umkm-services/{service_id}/`
- **Response:** 200 OK (Service object)

### 26. Update Service (Owner only)
- **URL:** PATCH `/api/umkm-services/{service_id}/`
- **Headers:** Authorization: Bearer {access_token}
- **Body:** (same as create)
- **Response:** 200 OK

### 27. Delete Service (Owner only)
- **URL:** DELETE `/api/umkm-services/{service_id}/`
- **Headers:** Authorization: Bearer {access_token}
- **Response:** 204 No Content

## ============================================================
## UMKM PRODUCT ENDPOINTS
## ============================================================

### 28. Get Products List
- **URL:** GET `/api/umkm-products/`
- **Query Params:** umkm_id=umkm_id
- **Response:** 200 OK (List of products)

### 29. Create Product (Owner only)
- **URL:** POST `/api/umkm-products/`
- **Headers:** Authorization: Bearer {access_token}
- **Body:**
{
  "umkm": "umkm_id",
  "nama_produk": "Keyboard Mechanical RGB",
  "deskripsi": "Keyboard gaming dengan RGB LED",
  "harga": 750000,
  "stok": 5
}
- **Response:** 201 Created

### 30. Get Product Detail
- **URL:** GET `/api/umkm-products/{product_id}/`
- **Response:** 200 OK (Product object)

### 31. Update Product (Owner only)
- **URL:** PATCH `/api/umkm-products/{product_id}/`
- **Headers:** Authorization: Bearer {access_token}
- **Body:** (same as create)
- **Response:** 200 OK

### 32. Delete Product (Owner only)
- **URL:** DELETE `/api/umkm-products/{product_id}/`
- **Headers:** Authorization: Bearer {access_token}
- **Response:** 204 No Content

## ============================================================
## UMKM GALLERY ENDPOINTS
## ============================================================

### 33. Get Gallery Images
- **URL:** GET `/api/umkm-gallery/`
- **Query Params:** umkm_id=umkm_id
- **Response:** 200 OK
{
  "count": 3,
  "results": [
    {
      "gallery_id": "uuid",
      "umkm": "umkm_id",
      "image": "https://...",
      "is_primary": true,
      "uploaded_at": "2026-05-20T10:00:00Z"
    }
  ]
}

### 34. Upload Gallery Image (Owner only)
- **URL:** POST `/api/umkm-gallery/`
- **Headers:** Authorization: Bearer {access_token}
- **Body:** (multipart/form-data)
  - umkm: umkm_id
  - image: (file)
  - is_primary: true|false
- **Response:** 201 Created

### 35. Delete Gallery Image (Owner only)
- **URL:** DELETE `/api/umkm-gallery/{gallery_id}/`
- **Headers:** Authorization: Bearer {access_token}
- **Response:** 204 No Content

## ============================================================
## UMKM REVIEW ENDPOINTS
## ============================================================

### 36. Get Reviews List
- **URL:** GET `/api/umkm-reviews/`
- **Query Params:** umkm_id=umkm_id
- **Response:** 200 OK (List of reviews)

### 37. Create Review (User only)
- **URL:** POST `/api/umkm-reviews/`
- **Headers:** Authorization: Bearer {access_token}
- **Body:**
{
  "umkm": "umkm_id",
  "rating": 4,
  "komentar": "Pelayanan sangat baik dan cepat!"
}
- **Response:** 201 Created

### 38. Get Review Detail
- **URL:** GET `/api/umkm-reviews/{review_id}/`
- **Response:** 200 OK (Review object)

### 39. Delete Review (Owner or User only)
- **URL:** DELETE `/api/umkm-reviews/{review_id}/`
- **Headers:** Authorization: Bearer {access_token}
- **Response:** 204 No Content

## ============================================================
## UTILITY ENDPOINTS
## ============================================================

### 40. Parse Google Maps URL
- **URL:** POST `/api/utils/parse-maps/`
- **Headers:** Authorization: Bearer {access_token} (optional)
- **Body:**
{
  "maps_url": "https://www.google.com/maps/place/Jakarta/@-6.2088,106.8456,15z"
}
- **Response:** 200 OK
{
  "latitude": -6.2088,
  "longitude": 106.8456,
  "nama_branch": "Location Name"
}

## ============================================================
## QUICK TEST WORKFLOW
## ============================================================

1. Register User:
   POST /api/auth/register/
   Save access_token from response

2. Get Current User:
   GET /api/auth/me/
   Header: Authorization: Bearer {access_token}

3. View Categories:
   GET /api/kategori/

4. Search UMKM by Category:
   GET /api/umkm/?kategori={kategori_id}

5. View UMKM Detail (with branches & gallery):
   GET /api/umkm/{umkm_id}/

6. Leave Review:
   POST /api/umkm-reviews/
   Body: {"umkm": "umkm_id", "rating": 5, "komentar": "Bagus!"}

## ============================================================
## POSTMAN SETUP TIPS
## ============================================================

1. Set up Environment Variable:
   - Variable: {{base_url}} = https://servpoint.my.id/api
   - Variable: {{access_token}} = (paste token from login/register)

2. Use {{base_url}} in all requests:
   - {{base_url}}/auth/register/
   - {{base_url}}/auth/login/
   - {{base_url}}/auth/me/
   - etc

3. Add Authorization Header:
   - Type: Bearer Token
   - Token: {{access_token}}

4. Test flow:
   1. Register atau Login untuk dapat token
   2. Copy access_token ke {{access_token}} variable
   3. Test semua endpoint dengan token tersebut
