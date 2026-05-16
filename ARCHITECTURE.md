# Dokumentasi Arsitektur LoService

## 1. Gambaran Umum Sistem

**LoService** adalah platform lokasi layanan yang menghubungkan pemilik UMKM dengan pengguna untuk menemukan berbagai jenis layanan dan produk. Sistem ini dibangun dengan arsitektur **3-tier (Client-Server-Database)** menggunakan teknologi modern.

### Tech Stack:
- **Backend**: Django + Django REST Framework (Python)
- **Frontend**: React + Vite (JavaScript/JSX)
- **Database**: SQLite/PostgreSQL
- **Authentication**: Email-based + OAuth Google
- **Media Storage**: Local file system + Cloud (optional)

---

## 2. Arsitektur Sistem Keseluruhan

```
┌─────────────────────────────────────────────────────────────────────┐
│                        WEB BROWSER / CLIENT                          │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │  React Frontend (Vite)    │
                    │  - Components             │
                    │  - Pages/Views            │
                    │  - Context API (State)    │
                    │  - React Router           │
                    └─────────────┬─────────────┘
                                  │ (HTTP/REST)
                    ┌─────────────▼─────────────────────────┐
                    │   Django REST API Backend              │
                    │   - Authentication                    │
                    │   - ViewSets & Serializers            │
                    │   - Permission Classes                │
                    │   - URL Routing                       │
                    └─────────────┬──────────────────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │   PostgreSQL Database      │
                    │   - User Management       │
                    │   - UMKM Data             │
                    │   - Transactions Log      │
                    └─────────────────────────────┘
```

---

## 3. Backend Architecture (Django)

### 3.1 Struktur Django Apps

```
loservice_backend/
├── loservice/               # Main project settings
│   ├── settings.py         # Configuration, installed apps
│   ├── urls.py             # Main URL routing
│   ├── wsgi.py             # WSGI entry point
│   └── asgi.py             # ASGI entry point
│
├── account/                # Core business logic app
│   ├── models.py           # Data models (User, UMKM, etc)
│   ├── serializer.py       # DRF serializers
│   ├── api_views.py        # API endpoints (ViewSets)
│   ├── api_urls.py         # API URL routing
│   ├── views.py            # Non-API views
│   ├── admin.py            # Django admin config
│   └── migrations/         # Database schema changes
│
└── owner/                  # Owner-specific features (optional)
    ├── models.py
    ├── views.py
    └── migrations/
```

### 3.2 Data Models

#### 3.2.1 User Model (Custom)
```
User (extends AbstractUser)
├── user_id (UUID) - Primary Key
├── email (Unique) - Login identifier
├── name
├── profile_picture
├── role (ADMIN, OWNER, USER)
├── created_at
└── update_at
```

#### 3.2.2 UMKM (Usaha Mikro Kecil Menengah) - Main Business Entity
```
UMKM
├── umkm_id (UUID) - Primary Key
├── user (FK → User/Owner)
├── kategori (FK → Kategori)
├── nama_umkm
├── deskripsi
├── telpon
├── status (PENDING, APPROVED, REJECTED)
├── reviewed_by (FK → Admin User)
├── created_at
└── update_at
```

#### 3.2.3 Related Models
```
Kategori (Kategori Layanan)
├── kategori_id (UUID)
├── nama_kategori (Unique)
└── deskripsi

UMKMBranch (Cabang UMKM)
├── branch_id (UUID)
├── umkm (FK → UMKM)
├── user (FK → User)
├── alamat
├── telpon
├── geom (Location JSON)
├── jam_buka / jam_tutup
└── hari_operasional

UMKMService (Layanan yang ditawarkan)
├── service_id (UUID)
├── umkm (FK → UMKM)
├── nama_service
├── deskripsi
├── harga_min / harga_max
└── estimasi_waktu

UMKMProduct (Produk yang dijual)
├── product_id (UUID)
├── umkm (FK → UMKM)
├── nama_produk
├── harga
└── image / image_url

UMKMReview (Ulasan/Rating)
├── review_id (UUID)
├── umkm (FK → UMKM)
├── user (FK → User)
├── rating (1-5)
├── comment
├── reply (Balasan owner)
└── created_at

UMKMGallery (Foto galeri UMKM)
├── gallery_id (UUID)
├── umkm (FK → UMKM)
├── image / image_url
└── uploaded_at

SearchLog (Riwayat pencarian)
├── search_id (UUID)
├── user (FK → User)
├── kategori (FK → Kategori)
├── keyword
└── timestamp

AuthSession (Sesi autentikasi)
├── user (FK → User)
├── token
├── expired_at
└── created_at

AuditLog (Catatan audit)
├── log_id (UUID)
├── user (FK → User)
├── umkm (FK → UMKM)
├── aksi
└── timestamp
```

### 3.3 API Architecture

#### REST Endpoints
```
Authentication:
POST   /auth/login/          - Email login
POST   /auth/register/       - Pendaftaran user
GET    /auth/me/             - Get current user
POST   /auth/google/         - Google OAuth login

User Management:
GET    /users/               - List users
GET    /users/{id}/          - Detail user
PUT    /users/{id}/          - Update user
DELETE /users/{id}/          - Delete user

UMKM Management:
GET    /umkm/                - List UMKM
POST   /umkm/                - Create UMKM (Owner)
GET    /umkm/{id}/           - Detail UMKM
PUT    /umkm/{id}/           - Update UMKM
DELETE /umkm/{id}/           - Delete UMKM

Categories:
GET    /kategori/            - List kategori
POST   /kategori/            - Create kategori (Admin)

Services:
GET    /services/            - List services
POST   /services/            - Create service (Owner)

Products:
GET    /products/            - List products
POST   /products/            - Create product (Owner)

Reviews:
GET    /reviews/             - List reviews
POST   /reviews/             - Create review

Gallery:
GET    /gallery/             - List gallery
POST   /gallery/             - Upload photo
```

#### Permission Classes
```
IsOwnerOrAdminForWrite:
├── GET requests        → AllowAny (Public read)
├── Write operations    → IsAuthenticated + OWNER/ADMIN role
└── Admin/Staff         → Full access
```

### 3.4 Authentication Flow

```
User Input (Email/Password or Google OAuth)
              │
              ▼
    ┌─────────────────┐
    │ API Auth Endpoint
    └────────┬────────┘
             │
    ┌────────▼──────────┐
    │ Validate Credentials
    └────────┬──────────┘
             │
    ┌────────▼──────────┐
    │ Generate JWT Token
    └────────┬──────────┘
             │
    ┌────────▼──────────┐
    │ Save to localStorage
    └────────┬──────────┘
             │
    ┌────────▼──────────┐
    │ Return User Object
    └────────────────────┘
```

---

## 4. Frontend Architecture (React)

### 4.1 Folder Structure

```
loservice_frontend/src/
├── App.jsx                 # Main routing & App wrapper
├── main.jsx               # React entry point
├── styles.css             # Global styles
│
├── components/            # Reusable UI components
│   ├── AuthPopup.jsx      # Auth modal
│   ├── LogoutConfirmModal.jsx
│   ├── OwnerGuard.jsx     # Route protection for owners
│   ├── PrivateRoute.jsx   # Route protection
│   └── Sidebar.jsx        # Navigation sidebar
│
├── pages/                 # Page components
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── GoogleCallback.jsx
│   ├── Dashboard.jsx      # User dashboard
│   ├── Owner.jsx          # Owner dashboard
│   ├── OwnerDashboard.jsx
│   ├── OwnerSettings.jsx
│   ├── OwnerGalleryComponents.jsx
│   ├── OwnerMap.jsx
│   ├── Admin.jsx
│   ├── KatalogJasa.jsx    # Service catalog
│   ├── UmkmDetail.jsx     # UMKM detail
│   ├── UmkmForm.jsx       # UMKM form
│   ├── UserMap.jsx
│   └── UserSettings.jsx
│
├── context/               # Global state management
│   └── AuthContext.jsx    # User auth state
│
├── services/              # API communication
│   └── api.js            # Axios instance & API calls
│
└── utils/                 # Utility functions
    └── responsive.js      # Responsive design helpers
```

### 4.2 Component Hierarchy

```
App (Root)
│
├── AuthProvider
│   │
│   └── Routes
│       ├── Public Routes
│       │   ├── /login → Login
│       │   ├── /register → Register
│       │   └── /auth/google/callback → GoogleCallback
│       │
│       └── Protected Routes (PrivateRoute)
│           ├── /dashboard → Dashboard
│           │
│           ├── /owner (+ OwnerGuard)
│           │   ├── /owner → Owner
│           │   ├── /owner/register-umkm → UmkmForm
│           │   ├── /owner/settings → OwnerSettings
│           │   └── /owner/map → OwnerMap
│           │
│           ├── /admin → Admin
│           │
│           ├── /katalog-jasa → KatalogJasa
│           ├── /umkm/:id → UmkmDetail
│           ├── /user/settings → UserSettings
│           └── /user/map → UserMap
```

### 4.3 State Management (Context API)

```
AuthContext
├── user                    # Current user object
├── loading                 # Loading state
├── error                   # Error messages
├── setUser()              # Update user
├── logout()               # Clear user & token
└── refetch()              # Re-authenticate
```

### 4.4 API Communication Flow

```
React Component
      │
      ├─ Calls API method
      │
      ▼
┌─────────────────────────┐
│ services/api.js         │
│ - Axios instance        │
│ - Auth headers          │
└────────────┬────────────┘
             │
             ▼
    ┌────────────────┐
    │ Django Backend │
    │ REST API       │
    └────────────────┘
             │
             ▼
    Update component state
    (useState, useEffect)
```

---

## 5. Data Flow Diagram

### 5.1 User Registration & Authentication

```
[User fills register form]
            │
            ▼
    POST /auth/register/
            │
            ▼
    ┌──────────────────────┐
    │ Validate email       │
    │ Hash password        │
    │ Create User record   │
    └──────────┬───────────┘
             │
             ├─ Success → Save token to localStorage
             │           Redirect to dashboard
             │
             └─ Error → Show error message
```

### 5.2 UMKM Creation Flow (Owner)

```
[Owner fills UMKM form]
            │
            ▼
    POST /umkm/
    (Body: nama_umkm, kategori, deskripsi, telpon)
            │
            ▼
    ┌──────────────────────┐
    │ Check permission     │
    │ (IsOwnerOrAdminWrite)
    └──────────┬───────────┘
             │
             ▼
    ┌──────────────────────┐
    │ Create UMKM record   │
    │ status = PENDING     │
    │ user = current user  │
    └──────────┬───────────┘
             │
             ▼
    ┌──────────────────────┐
    │ Admin review         │
    │ status → APPROVED/   │
    │ REJECTED             │
    └──────────┬───────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
APPROVED        REJECTED
(Visible)      (Hidden)
```

### 5.3 UMKM Search & Browse Flow

```
[User searches "Tukang Bangunan"]
            │
            ▼
    GET /umkm/?search=Tukang+Bangunan
    GET /kategori/
            │
            ▼
    ┌──────────────────────┐
    │ Query UMKM with      │
    │ - keyword search     │
    │ - filter by kategori │
    │ - status = APPROVED  │
    │ - sort by rating     │
    └──────────┬───────────┘
             │
             ▼
    ┌──────────────────────┐
    │ Create SearchLog     │
    │ (analytics)          │
    └──────────┬───────────┘
             │
             ▼
    Display results in
    KatalogJasa page
```

---

## 6. Security Architecture

### 6.1 Authentication & Authorization

```
┌─────────────────────────────────────┐
│   Request with Token                 │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   Middleware: Verify JWT Token       │
└────────────┬────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
Valid              Invalid
    │                 │
    ▼                 ▼
Continue      Return 401 Unauthorized
```

### 6.2 Role-Based Access Control (RBAC)

```
USER Roles:
├── ADMIN
│   └── Full access to all resources
│       - Manage users
│       - Approve/reject UMKM
│       - Create categories
│       - View audit logs
│
├── OWNER
│   └── Manage own UMKM
│       - Register UMKM
│       - Add products/services
│       - Manage branches
│       - Reply to reviews
│
└── USER
    └── Browse & search UMKM
        - View UMKM details
        - Leave reviews
        - Search functionality
```

### 6.3 Permission Classes in Django

```
IsOwnerOrAdminForWrite:
├── GET → Allow all (Public)
├── POST/PUT/DELETE → Allow if:
│   ├── User is staff/superuser
│   └── User has OWNER or ADMIN role
└── Otherwise → 403 Forbidden
```

---

## 7. Key Features & Their Implementation

### 7.1 UMKM Management
- **Owner dapat membuat UMKM baru** → UmkmForm page + POST /umkm/
- **Admin review status UMKM** → Admin dashboard + PUT /umkm/{id}/approve
- **Menampilkan UMKM terdaftar** → KatalogJasa page + GET /umkm/

### 7.2 Location-Based Services
- **Branch management** → UMKMBranch model + geom field (JSON)
- **Map visualization** → OwnerMap.jsx, UserMap.jsx
- **Operating hours** → UMKMBranch.jam_buka, jam_tutup

### 7.3 Product & Service Management
- **Add products** → UMKMProduct model + POST /products/
- **Add services** → UMKMService model + POST /services/
- **Pricing info** → harga field

### 7.4 Review & Rating System
- **Leave reviews** → UMKMReview model + POST /reviews/
- **Owner replies** → UMKMReview.reply + reply_at
- **Rating display** → Calculate average from reviews

### 7.5 Gallery Management
- **Upload photos** → UMKMGallery model + image upload
- **Display gallery** → OwnerGalleryComponents.jsx

---

## 8. Database Schema Relationships

```
User
├── 1 → Many: UMKM (user_id)
├── 1 → Many: UMKMBranch (user_id)
├── 1 → Many: UMKMReview (user_id)
├── 1 → Many: SearchLog (user_id)
├── 1 → Many: AuthSession (user_id)
└── 1 → Many: AuditLog (user_id)

Kategori
├── 1 → Many: UMKM (kategori_id)
├── 1 → Many: SearchLog (kategori_id)
└── 1 → Many: UMKMImages (kategori_id)

UMKM
├── 1 → Many: UMKMBranch (umkm_id)
├── 1 → Many: UMKMService (umkm_id)
├── 1 → Many: UMKMProduct (umkm_id)
├── 1 → Many: UMKMReview (umkm_id)
├── 1 → Many: UMKMGallery (umkm_id)
└── 1 → Many: AuditLog (umkm_id)
```

---

## 9. API Request/Response Examples

### 9.1 Login Request
```
POST /auth/login/
Content-Type: application/json

{
  "email": "owner@example.com",
  "password": "password123"
}

Response (200):
{
  "access_token": "eyJhbGc...",
  "user": {
    "user_id": "uuid",
    "email": "owner@example.com",
    "name": "John Doe",
    "role": "OWNER"
  }
}
```

### 9.2 Create UMKM Request
```
POST /umkm/
Authorization: Bearer {token}
Content-Type: application/json

{
  "nama_umkm": "Tukang Bangunan Jaya",
  "kategori": "uuid-kategori",
  "deskripsi": "Jasa perbaikan dan renovasi bangunan",
  "telpon": "0812345678"
}

Response (201):
{
  "umkm_id": "uuid",
  "user": "uuid",
  "nama_umkm": "Tukang Bangunan Jaya",
  "status": "PENDING",
  "created_at": "2024-04-19T10:00:00Z"
}
```

### 9.3 Get UMKM List
```
GET /umkm/?kategori=uuid&search=keyword&limit=10&offset=0

Response (200):
{
  "count": 100,
  "next": "http://.../umkm/?offset=10",
  "previous": null,
  "results": [
    {
      "umkm_id": "uuid",
      "nama_umkm": "...",
      "status": "APPROVED",
      "rating": 4.5,
      "total_reviews": 12
    },
    ...
  ]
}
```

---

## 10. Deployment Architecture

```
┌─────────────────────────────────────────────┐
│         Web Server (Nginx/Apache)            │
│         - Serve static files                 │
│         - Proxy to backend                   │
└────────────┬────────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
React App      Django Backend
(Vite build)   (Gunicorn/uWSGI)
    │                 │
    └────────┬────────┘
             │
    ┌────────▼────────┐
    │  PostgreSQL      │
    │  Database        │
    └──────────────────┘

Media Storage:
├── Local: /media/ folder
└── Optional: AWS S3, GCS, etc.
```

---

## 11. Development Workflow

### 11.1 Local Development Setup
```
Backend:
$ python -m venv venv
$ source venv/bin/activate (or venv\Scripts\activate on Windows)
$ pip install -r requirements.txt
$ python manage.py migrate
$ python manage.py runserver

Frontend:
$ npm install
$ npm run dev
```

### 11.2 API Testing
- Gunakan Postman atau insomnia
- Buat environment dengan base URL & token
- Test setiap endpoint dengan berbagai scenarios

### 11.3 Frontend Testing
- React DevTools
- Network tab untuk inspect API calls
- Console untuk debug state

---

## 12. Future Enhancements

1. **Notification System** - Email/SMS alerts untuk reviews & orders
2. **Payment Integration** - Stripe/Midtrans untuk transaksi
3. **Advanced Search** - ElasticSearch untuk performance
4. **Mobile App** - React Native untuk iOS/Android
5. **Real-time Chat** - WebSocket untuk komunikasi owner-user
6. **Analytics Dashboard** - Metrics & insights untuk owners
7. **Rating System Upgrade** - More granular review categories

---

## 13. Architecture Diagram Summary

```
LAYERS:

┌─────────────────────────────────────────────┐
│  PRESENTATION LAYER                         │
│  React Components, Pages, Routing            │
└────────────┬────────────────────────────────┘
             │
┌────────────▼────────────────────────────────┐
│  APPLICATION LAYER                          │
│  Context API, Services, State Management    │
└────────────┬────────────────────────────────┘
             │
┌────────────▼────────────────────────────────┐
│  API LAYER                                   │
│  REST Endpoints, Authentication, CORS       │
└────────────┬────────────────────────────────┘
             │
┌────────────▼────────────────────────────────┐
│  BUSINESS LOGIC LAYER                       │
│  Django ViewSets, Serializers, Permissions  │
└────────────┬────────────────────────────────┘
             │
┌────────────▼────────────────────────────────┐
│  DATA LAYER                                  │
│  Django ORM, Models, Database                │
└─────────────────────────────────────────────┘
```

---

## Kesimpulan

Arsitektur LoService mengikuti prinsip-prinsip modern:
- ✅ **Separation of Concerns** - Backend & Frontend terpisah jelas
- ✅ **Scalability** - Modular design memudahkan expand features
- ✅ **Security** - Authentication & authorization built-in
- ✅ **Maintainability** - Clean code structure untuk team collaboration
- ✅ **RESTful API** - Standard untuk integrasi berbagai platform

Dengan arsitektur ini, sistem dapat berkembang & maintain dengan baik seiring pertumbuhan bisnis.
