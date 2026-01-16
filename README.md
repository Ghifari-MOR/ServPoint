# ServPoint - UMKM Location Service Platform

Platform digital untuk membantu UMKM menampilkan lokasi, layanan, dan produk mereka kepada pelanggan. ServPoint menyediakan fitur peta interaktif, katalog jasa, galeri produk, dan sistem review.

## 🛠️ Tech Stack

### Backend (API Server dengan authentication & media handling)
- Framework: **Django**
- Database: **PostgreSQL** (atau SQLite untuk development)
- Authentication: **JWT** + **Google OAuth**
- API: **Django REST Framework (DRF)**
- Media Storage: **Local Storage**
- Validation: **Django Validators**

### Frontend (Web Application)
- Framework: **React.js (Vite)**
- State Management: **Context API**
- Routing: **React Router**
- Maps: **Leaflet.js**
- Styling: **CSS + Modern UI**
- HTTP Client: **Axios**

---

## 📁 Struktur Folder

```
ServPoint/
├── 📄 loservice                      # Project documentation
├── 📄 start-backend.bat              # Script untuk menjalankan backend
├── 📄 start-frontend.bat             # Script untuk menjalankan frontend
├── 📄 test_upload.html               # Testing file upload
├── 📄 .gitignore                     # Git ignore configuration
│
├── 📂 loservice_backend/             # Backend Django Application
│   ├── manage.py                     # Django management script
│   ├── run_migrations.py             # Migration runner
│   ├── fix_admin_permission.py       # Admin permission fixer
│   │
│   ├── 📂 account/                   # User & UMKM management
│   │   ├── models.py                 # User, UMKM, Product, Review models
│   │   ├── api_views.py              # REST API endpoints
│   │   ├── api_urls.py               # API URL routing
│   │   ├── serializer.py             # Data serializers
│   │   ├── views.py                  # Web views
│   │   └── 📂 migrations/            # Database migrations
│   │
│   ├── 📂 owner/                     # Owner-specific features
│   │   └── (owner management logic)
│   │
│   ├── 📂 renamennti_backend/        # Django project settings
│   │   ├── settings.py               # Configuration & settings
│   │   ├── urls.py                   # Main URL routing
│   │   ├── wsgi.py                   # WSGI application
│   │   └── asgi.py                   # ASGI application
│   │
│   ├── 📂 media/                     # User uploaded files
│   │   ├── gallery/                  # UMKM gallery images
│   │   └── profile_pictures/         # User profile pictures
│   │
│   └── 📂 templates/                 # HTML templates
│       └── admin/                    # Custom admin templates
│
└── 📂 loservice_frontend/            # Frontend React Application
    ├── package.json                  # Dependencies & scripts
    ├── vite.config.js                # Vite configuration
    ├── index.html                    # Main HTML file
    │
    └── 📂 src/
        ├── App.jsx                   # Main application component
        ├── main.jsx                  # Application entry point
        ├── styles.css                # Global styles
        │
        ├── 📂 components/            # Reusable components
        │   ├── AuthPopup.jsx         # Authentication modal
        │   ├── OwnerGuard.jsx        # Owner route protection
        │   ├── PrivateRoute.jsx      # Authentication guard
        │   └── Sidebar.jsx           # Navigation sidebar
        │
        ├── 📂 context/               # React Context
        │   └── AuthContext.jsx       # Authentication state
        │
        ├── 📂 pages/                 # Page components
        │   ├── Dashboard.jsx         # User dashboard
        │   ├── Login.jsx             # Login page
        │   ├── Register.jsx          # Registration page
        │   ├── Admin.jsx             # Admin panel
        │   ├── Owner.jsx             # Owner dashboard
        │   ├── OwnerDashboard.jsx    # Owner main dashboard
        │   ├── OwnerSettings.jsx     # Owner settings
        │   ├── OwnerMap.jsx          # Owner map management
        │   ├── OwnerGalleryComponents.jsx  # Gallery management
        │   ├── UserMap.jsx           # User map view
        │   ├── UserSettings.jsx      # User settings
        │   ├── KatalogJasa.jsx       # Service catalog
        │   ├── UmkmDetail.jsx        # UMKM detail page
        │   ├── UmkmForm.jsx          # UMKM form
        │   └── GoogleCallback.jsx    # OAuth callback handler
        │
        └── 📂 services/              # API integration
            └── api.js                # API service layer
```

---

## 🚀 Installation

### 1. Clone & Install Dependencies

#### Backend Setup:
```bash
# Navigate to backend directory
cd loservice_backend

# Install Python dependencies
pip install django djangorestframework django-cors-headers pillow python-decouple djangorestframework-simplejwt

# Or if you have requirements.txt:
pip install -r requirements.txt
```

#### Frontend Setup:
```bash
# Navigate to frontend directory
cd loservice_frontend

# Install Node dependencies
npm install
```

---

### 2. Setup Database

```bash
# Run migrations
cd loservice_backend
python manage.py makemigrations
python manage.py migrate

# Create superuser (admin)
python manage.py createsuperuser
```

---

### 3. Konfigurasi Environment

Buat file `.env` di folder `loservice_backend/renamennti_backend/`:

```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (optional, default menggunakan SQLite)
# DB_ENGINE=django.db.backends.postgresql
# DB_NAME=servpoint_db
# DB_USER=postgres
# DB_PASSWORD=yourpassword
# DB_HOST=localhost
# DB_PORT=5432

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

Buat file `.env` di folder `loservice_frontend/`:

```env
VITE_API_URL=http://127.0.0.1:8000
```

---

### 4. Run Application

#### Menggunakan Batch Scripts (Windows):

```bash
# Terminal 1 - Backend
start-backend.bat

# Terminal 2 - Frontend
start-frontend.bat
```

#### Atau Manual:

**Backend:**
```bash
cd loservice_backend
python manage.py runserver
```

**Frontend:**
```bash
cd loservice_frontend
npm run dev
```

---

## 📱 Akses Aplikasi

- **Frontend:** http://localhost:5173
- **Backend API:** http://127.0.0.1:8000
- **Admin Panel:** http://127.0.0.1:8000/admin

---

## 👥 User Roles

1. **Admin** - Mengelola seluruh sistem, verifikasi UMKM
2. **Owner** - Pemilik UMKM, mengelola data bisnis mereka
3. **User** - Pengguna umum, melihat dan review UMKM

---

## ✨ Fitur Utama

- 🗺️ **Peta Interaktif** - Pencarian UMKM berdasarkan lokasi
- 📸 **Galeri Produk** - Upload dan kelola foto produk/jasa
- ⭐ **Sistem Review** - Rating dan ulasan pelanggan
- 🔐 **Multi Authentication** - Email/Password & Google OAuth
- 👤 **Profile Management** - Kelola data user dan UMKM
- 📊 **Dashboard** - Monitoring data untuk owner dan admin
- 🎯 **Katalog Jasa** - Daftar lengkap layanan UMKM

---

## 📝 API Endpoints

### Authentication
- `POST /api/register/` - Register user baru
- `POST /api/login/` - Login dengan email/password
- `POST /api/google-login/` - Login dengan Google
- `POST /api/token/refresh/` - Refresh JWT token

### UMKM Management
- `GET /api/umkm/` - List semua UMKM
- `POST /api/umkm/create/` - Buat UMKM baru
- `PUT /api/umkm/<id>/update/` - Update UMKM
- `GET /api/umkm/<id>/` - Detail UMKM

### Products & Services
- `GET /api/products/` - List produk UMKM
- `POST /api/products/create/` - Tambah produk
- `GET /api/services/` - List layanan UMKM

### Reviews
- `GET /api/reviews/<umkm_id>/` - List review UMKM
- `POST /api/reviews/create/` - Buat review baru
- `POST /api/reviews/<id>/reply/` - Reply review

---

## 🔧 Troubleshooting

### Backend tidak jalan:
```bash
# Fix admin permissions
python fix_admin_permission.py

# Atau jalankan migrations ulang
python manage.py migrate
```

### Frontend tidak konek ke backend:
- Pastikan CORS settings sudah benar di `settings.py`
- Check `VITE_API_URL` di frontend `.env`

---

## 📄 License

This project is developed for educational purposes.

---

## 👨‍💻 Developer

Developed with ❤️ for Indonesian UMKM
