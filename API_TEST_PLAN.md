# Rencana Pengujian API - LoService Platform

**Tanggal**: May 1, 2026  
**Status**: Active  
**Version**: 1.0

---

## 📋 Daftar Isi

1. [Tujuan Pengujian](#tujuan-pengujian)
2. [Scope Pengujian](#scope-pengujian)
3. [Strategi Pengujian](#strategi-pengujian)
4. [Test Scenarios](#test-scenarios)
5. [Test Cases Detail](#test-cases-detail)
6. [Tools & Environment](#tools--environment)
7. [Kriteria Kelulusan](#kriteria-kelulusan)
8. [Timeline](#timeline)

---

## 🎯 Tujuan Pengujian

Memastikan semua API endpoints LoService berfungsi dengan baik dan sesuai dengan spesifikasi, mencakup:
- ✅ Fungsionalitas endpoint (happy path)
- ✅ Validasi input & error handling
- ✅ Autentikasi & Otorisasi
- ✅ Response format & status codes
- ✅ Keamanan data
- ✅ Performance (jika diperlukan)

---

## 📌 Scope Pengujian

### API Endpoints yang Ditest:

#### **Authentication & User Management**
- `POST /auth/register` - Register user baru
- `POST /auth/login` - Login user
- `GET /api/users/` - List semua users
- `GET /api/users/{id}/` - Detail user
- `PUT /api/users/{id}/` - Update profile user
- `POST /api/users/upload-profile-picture/` - Upload foto profil

#### **Kategori**
- `GET /api/kategori/` - List kategori
- `POST /api/kategori/` - Buat kategori baru (Admin only)
- `PUT /api/kategori/{id}/` - Update kategori (Admin only)
- `DELETE /api/kategori/{id}/` - Hapus kategori (Admin only)

#### **UMKM (Business)**
- `GET /api/umkm/` - List UMKM
- `POST /api/umkm/` - Buat UMKM baru (Owner)
- `GET /api/umkm/{id}/` - Detail UMKM
- `PUT /api/umkm/{id}/` - Update UMKM (Owner)
- `DELETE /api/umkm/{id}/` - Hapus UMKM (Owner)
- `POST /api/umkm/{id}/approve/` - Approve UMKM (Admin)
- `POST /api/umkm/{id}/reject/` - Reject UMKM (Admin)

#### **UMKM Services**
- `GET /api/umkm-services/` - List services
- `POST /api/umkm-services/` - Buat service baru
- `GET /api/umkm-services/{id}/` - Detail service
- `PUT /api/umkm-services/{id}/` - Update service
- `DELETE /api/umkm-services/{id}/` - Hapus service

#### **UMKM Products**
- `GET /api/umkm-products/` - List products
- `POST /api/umkm-products/` - Buat product baru
- `GET /api/umkm-products/{id}/` - Detail product
- `PUT /api/umkm-products/{id}/` - Update product
- `DELETE /api/umkm-products/{id}/` - Hapus product

#### **UMKM Gallery**
- `GET /api/umkm-gallery/` - List gallery
- `POST /api/umkm-gallery/` - Upload gallery image
- `GET /api/umkm-gallery/{id}/` - Detail gallery
- `DELETE /api/umkm-gallery/{id}/` - Hapus gallery

#### **UMKM Reviews**
- `GET /api/umkm-reviews/` - List reviews
- `POST /api/umkm-reviews/` - Buat review baru
- `GET /api/umkm-reviews/{id}/` - Detail review
- `PUT /api/umkm-reviews/{id}/` - Update review
- `DELETE /api/umkm-reviews/{id}/` - Hapus review
- `POST /api/umkm-reviews/{id}/reply/` - Reply review (Owner)

#### **Utility**
- `POST /api/utils/parse-maps/` - Parse maps URL

---

## 🔍 Strategi Pengujian

### 1. **Functional Testing**
Menguji setiap endpoint dengan input yang valid dan expected output.

### 2. **Validation Testing**
Menguji validation rules dengan input yang tidak valid:
- Empty fields
- Invalid format (email, URL, etc)
- Out of range values
- Special characters

### 3. **Authentication & Authorization Testing**
- Login dengan credentials yang benar/salah
- Akses endpoint dengan/tanpa token
- Role-based access control (ADMIN, OWNER, USER)
- Token expiration

### 4. **Security Testing**
- SQL Injection
- XSS prevention
- CSRF protection
- Password hashing
- Data encryption (if applicable)

### 5. **Response Testing**
- Status codes (200, 201, 400, 401, 403, 404, 500)
- Response format (JSON)
- Response headers
- Error messages

### 6. **Edge Cases**
- Duplicate data (unique constraints)
- Concurrent requests
- Large payloads
- Missing required fields

---

## 📊 Test Scenarios

### **Scenario 1: User Registration & Login**

| No | Skenario | Method/Endpoint | Input | Expected | Hasil |
|----|----------|-----------------|-------|----------|-------|
| 1.1 | Registrasi berhasil | POST /auth/register | `{ "name": "Test User", "email": "test@example.com", "password": "password123" }` | Status: 201, Pengguna baru dibuat | ✓ |
| 1.2 | Email sudah digunakan | POST /auth/register | `{ "name": "Test User", "email": "test@example.com", "password": "password123" }` | Status: 400, Error: email already exists | ✓ |
| 1.3 | Input kosong | POST /auth/register | `{ "name": "", "email": "", "password": "" }` | Status: 400, Invalid input | ✓ |
| 1.4 | Password kurang dari 6 karakter | POST /auth/register | `{ "name": "Test User", "email": "test2@example.com", "password": "123" }` | Status: 400, Error: Invalid input | ✓ |
| 1.5 | Login berhasil | POST /auth/login | `{ "email": "test@example.com", "password": "password123" }` | Status: 200, Token received | ✓ |
| 1.6 | Login dengan email salah | POST /auth/login | `{ "email": "wrong@example.com", "password": "password123" }` | Status: 401, Error: Invalid credentials | ✓ |
| 1.7 | Login dengan password salah | POST /auth/login | `{ "email": "test@example.com", "password": "wrongpass" }` | Status: 401, Error: Invalid credentials | ✓ |

### **Scenario 2: UMKM Management**

| No | Skenario | Method/Endpoint | Input | Expected | Hasil |
|----|----------|-----------------|-------|----------|-------|
| 2.1 | Buat UMKM baru | POST /api/umkm/ | `{ "nama_umkm": "Toko ABC", "kategori_id": "cat-123", "deskripsi": "...", "telpon": "08123..." }` | Status: 201, UMKM created | ✓ |
| 2.2 | List UMKM | GET /api/umkm/ | - | Status: 200, Array UMKM | ✓ |
| 2.3 | Detail UMKM | GET /api/umkm/{id}/ | - | Status: 200, UMKM detail | ✓ |
| 2.4 | Update UMKM | PUT /api/umkm/{id}/ | Updated data | Status: 200, UMKM updated | ✓ |
| 2.5 | Hapus UMKM | DELETE /api/umkm/{id}/ | - | Status: 204, UMKM deleted | ✓ |
| 2.6 | Update UMKM milik user lain | PUT /api/umkm/other-id/ | Updated data | Status: 403, Forbidden | ✓ |
| 2.7 | Approve UMKM (Admin only) | POST /api/umkm/{id}/approve/ | - | Status: 200, UMKM approved | ✓ |
| 2.8 | Approve tanpa admin role | POST /api/umkm/{id}/approve/ | - | Status: 403, Forbidden | ✓ |

### **Scenario 3: Kategori Management**

| No | Skenario | Method/Endpoint | Input | Expected | Hasil |
|----|----------|-----------------|-------|----------|-------|
| 3.1 | List kategori | GET /api/kategori/ | - | Status: 200, Array kategori | ✓ |
| 3.2 | Buat kategori (Admin) | POST /api/kategori/ | `{ "nama_kategori": "Elektronik", "deskripsi": "..." }` | Status: 201, Kategori created | ✓ |
| 3.3 | Buat kategori (Non-Admin) | POST /api/kategori/ | Data | Status: 403, Forbidden | ✓ |
| 3.4 | Kategori nama duplikat | POST /api/kategori/ | `{ "nama_kategori": "Elektronik" }` | Status: 400, Unique constraint | ✓ |
| 3.5 | Update kategori (Admin) | PUT /api/kategori/{id}/ | Updated data | Status: 200, Kategori updated | ✓ |
| 3.6 | Hapus kategori (Admin) | DELETE /api/kategori/{id}/ | - | Status: 204, Deleted | ✓ |

### **Scenario 4: Products & Services**

| No | Skenario | Method/Endpoint | Input | Expected | Hasil |
|----|----------|-----------------|-------|----------|-------|
| 4.1 | Buat produk | POST /api/umkm-products/ | `{ "umkm_id": "umkm-123", "nama_produk": "...", ... }` | Status: 201, Produk created | ✓ |
| 4.2 | Buat service | POST /api/umkm-services/ | `{ "umkm_id": "umkm-123", "nama_service": "...", ... }` | Status: 201, Service created | ✓ |
| 4.3 | List produk by UMKM | GET /api/umkm-products/?umkm_id=umkm-123 | - | Status: 200, Array produk | ✓ |
| 4.4 | List service by UMKM | GET /api/umkm-services/?umkm_id=umkm-123 | - | Status: 200, Array service | ✓ |
| 4.5 | Update produk milik sendiri | PUT /api/umkm-products/{id}/ | Updated data | Status: 200, Updated | ✓ |
| 4.6 | Hapus produk | DELETE /api/umkm-products/{id}/ | - | Status: 204, Deleted | ✓ |

### **Scenario 5: Gallery & Reviews**

| No | Skenario | Method/Endpoint | Input | Expected | Hasil |
|----|----------|-----------------|-------|----------|-------|
| 5.1 | Upload gallery image | POST /api/umkm-gallery/ | `{ "umkm_id": "...", "image": <file> }` | Status: 201, Image uploaded | ✓ |
| 5.2 | List gallery | GET /api/umkm-gallery/?umkm_id=umkm-123 | - | Status: 200, Array gambar | ✓ |
| 5.3 | Hapus gallery | DELETE /api/umkm-gallery/{id}/ | - | Status: 204, Deleted | ✓ |
| 5.4 | Buat review | POST /api/umkm-reviews/ | `{ "umkm_id": "...", "rating": 5, "review": "..." }` | Status: 201, Review created | ✓ |
| 5.5 | List review | GET /api/umkm-reviews/?umkm_id=umkm-123 | - | Status: 200, Array review | ✓ |
| 5.6 | Reply review (Owner) | POST /api/umkm-reviews/{id}/reply/ | `{ "reply": "Terima kasih..." }` | Status: 200, Reply added | ✓ |
| 5.7 | Update review milik sendiri | PUT /api/umkm-reviews/{id}/ | Updated data | Status: 200, Updated | ✓ |
| 5.8 | Hapus review | DELETE /api/umkm-reviews/{id}/ | - | Status: 204, Deleted | ✓ |

---

## 🧪 Test Cases Detail

### **Test Case 1.1: Registrasi Berhasil**
```
ID: TC-1.1
Title: Registrasi pengguna baru berhasil
Precondition: Database dalam kondisi clean
Steps:
  1. Send POST /auth/register
  2. Payload: { "name": "Test User", "email": "newuser@example.com", "password": "SecurePass123" }
Expected Result:
  - Status Code: 201 Created
  - Response: { "id": "...", "email": "newuser@example.com", "name": "Test User", "role": "USER" }
  - User dapat login dengan credentials baru
```

### **Test Case 1.2: Email Sudah Digunakan**
```
ID: TC-1.2
Title: Registrasi dengan email yang sudah terdaftar
Precondition: User dengan email "existing@example.com" sudah terdaftar
Steps:
  1. Send POST /auth/register
  2. Payload: { "name": "Another User", "email": "existing@example.com", "password": "Pass123" }
Expected Result:
  - Status Code: 400 Bad Request
  - Response: { "error": "Email already exists" }
  - User baru tidak terbuat
```

### **Test Case 2.1: Buat UMKM Baru**
```
ID: TC-2.1
Title: Owner dapat membuat UMKM baru
Precondition: 
  - User login sebagai OWNER
  - Token valid
  - Kategori sudah ada dengan ID "cat-001"
Steps:
  1. Get token dari login
  2. Send POST /api/umkm/ dengan Authorization header
  3. Payload: {
       "nama_umkm": "Toko Elektronik Jaya",
       "kategori_id": "cat-001",
       "deskripsi": "Toko elektronik terpercaya",
       "telpon": "08123456789"
     }
Expected Result:
  - Status Code: 201 Created
  - Response mengandung UMKM ID dan status "PENDING"
  - UMKM muncul di list dengan owner adalah user yang login
```

### **Test Case 2.7: Approve UMKM (Admin Only)**
```
ID: TC-2.7
Title: Admin dapat approve UMKM pending
Precondition: 
  - User login sebagai ADMIN
  - UMKM dengan status "PENDING" sudah ada dengan ID "umkm-001"
  - Token valid
Steps:
  1. Get token dari admin login
  2. Send POST /api/umkm/umkm-001/approve/
  3. Authorization header dengan admin token
Expected Result:
  - Status Code: 200 OK
  - Response: { "status": "APPROVED", "reviewed_by": "admin-id", ... }
  - UMKM status berubah menjadi "APPROVED" di database
```

### **Test Case 5.1: Upload Gallery Image**
```
ID: TC-5.1
Title: Upload gambar ke gallery UMKM
Precondition:
  - User login sebagai owner UMKM
  - UMKM dengan ID "umkm-001" exist dan milik user
  - File image valid (JPG/PNG, max 5MB)
Steps:
  1. Get token
  2. Send POST /api/umkm-gallery/
  3. Headers: Authorization, Content-Type: multipart/form-data
  4. Payload: 
     - umkm_id: "umkm-001"
     - image: <binary image file>
Expected Result:
  - Status Code: 201 Created
  - Response: { "id": "...", "umkm_id": "...", "image_url": "...", "created_at": "..." }
  - Image file tersimpan di /media/gallery/
  - Image dapat diakses melalui URL yang dikembalikan
```

---

## 🛠️ Tools & Environment

### **Testing Tools**
- **Postman**: Collection-based testing + automated tests
- **cURL**: Command-line testing (if needed)
- **Python Requests**: Scripted testing
- **Thunder Client**: Alternative REST client

### **Environments**
```
1. Local Development
   - Backend: http://localhost:8000
   - Frontend: http://localhost:3000
   - Database: SQLite

2. Staging (if available)
   - Backend: http://staging-api.example.com
   - Database: PostgreSQL

3. Production (after approval)
   - Backend: http://api.example.com
```

### **Test Data Requirements**
```
1. Test Users:
   - Admin account
   - Owner account
   - Regular user account
   - Test accounts untuk duplicate testing

2. Test Data:
   - Sample UMKM data
   - Sample products/services
   - Sample categories
   - Sample images (untuk gallery)
   - Sample reviews

3. Files:
   - Valid image files (JPG, PNG)
   - Invalid files (untuk error testing)
```

---

## ✅ Kriteria Kelulusan

### **Pass Criteria**
- ✅ Semua test cases berstatus PASS
- ✅ Status code sesuai dengan expected
- ✅ Response format valid JSON
- ✅ No unexpected errors (500, 502, 503)
- ✅ Performance: Response time < 2 seconds
- ✅ Data validation berfungsi
- ✅ Authorization checks berfungsi
- ✅ Database transactions consistent
- ✅ No SQL injection vulnerabilities
- ✅ No data leakage

### **Fail Criteria**
- ❌ Ada test case yang FAIL
- ❌ Status code tidak sesuai
- ❌ Response format invalid
- ❌ Server error (5xx status codes)
- ❌ Authorization bypass
- ❌ Data inconsistency
- ❌ Security vulnerabilities
- ❌ Performance issues

### **Defect Severity**
```
CRITICAL: 
  - Server crash
  - Authorization bypass
  - Data loss
  - SQL injection vulnerability

HIGH:
  - Wrong response code
  - Missing validation
  - Data corruption
  - Performance degradation

MEDIUM:
  - Invalid error messages
  - Missing fields in response
  - Minor formatting issues

LOW:
  - Typos
  - Documentation inconsistency
```

---

## 📅 Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **Planning** | 1-2 hari | Test plan, test cases, environment setup |
| **Test Case Creation** | 2-3 hari | Detailed test cases, Postman collections |
| **Functional Testing** | 3-4 hari | Test execution, bug reports |
| **Validation Testing** | 2-3 hari | Input validation, edge cases |
| **Security Testing** | 2 hari | Security vulnerability assessment |
| **Regression Testing** | 1-2 hari | Re-test setelah bug fixes |
| **Final Verification** | 1 hari | Sign-off, release approval |

---

## 📝 Checklist Pre-Testing

- [ ] Environment setup (Local/Staging)
- [ ] Database cleanup/reset
- [ ] Test user accounts created
- [ ] Postman collections ready
- [ ] Test data prepared
- [ ] API documentation reviewed
- [ ] Team members briefed
- [ ] Bug tracking system ready
- [ ] Performance baseline established
- [ ] Security audit completed

---

## 📞 Contact & Escalation

| Role | Name | Contact |
|------|------|---------|
| Test Lead | [Name] | [Email/Phone] |
| Developer | [Name] | [Email/Phone] |
| QA Engineer | [Name] | [Email/Phone] |
| Product Owner | [Name] | [Email/Phone] |

---

## 📎 Attachments

- Test Data Spreadsheet
- Environment Configuration
- Postman Collection Backup
- API Documentation

---

**Document Version**: 1.0  
**Last Updated**: May 1, 2026  
**Next Review**: After API implementation complete
