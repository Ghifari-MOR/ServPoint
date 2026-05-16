# Fix untuk Issue: Review Terkirim dengan User Account yang Salah

## 📋 Ringkasan Masalah
Saat login dengan akun USER "syahri", mengirim ulasan pada halaman detail UMKM, tapi ulasan yang terkirim malah menampilkan akun OWNER "servisnih" sebagai pembuat review.

## ✅ Perbaikan yang Sudah Dilakukan

### 1. Backend Enhancement (api_views.py)
```python
def perform_create(self, serializer):
    # Explicit validation + logging
    - Memastikan user authenticated sebelum menyimpan review
    - Logging detail: siapa yang membuat review (email, ID, role)
    - Throw error jika user tidak authenticated
```

### 2. Debug Endpoint
Tambahan endpoint untuk verify user yang authenticated:
```
GET /api/umkm-reviews/debug-auth-user/
```
Response akan menunjukkan:
- user_id
- email
- name  
- role
- is_staff, is_superuser

### 3. Frontend Enhancement (UmkmDetail.jsx)
```javascript
- Login validation sebelum submit review
- Console logging: authenticated user info before & after submit
- Better error messages
```

## 🔍 Langkah-Langkah Testing & Debugging

### Step 1: Verify User Account Existence
Jalankan diagnostic script di Django shell:
```bash
python manage.py shell
exec(open('diagnostic_script.py').read())
```

Ini akan menampilkan:
- Apakah ada duplicate email (syahri@gmail.com registered 2x?)
- User ID untuk syahri dan servisnih
- Reviews yang ada dan siapa yang buatnya

### Step 2: Check Browser Console
1. Clear localStorage dan cache (Ctrl+Shift+Delete)
2. Refresh halaman
3. Open DevTools (F12) → Console tab
4. Login as syahri (USER account)
5. Go to UMKM detail page
6. Click "Tulis Ulasan" dan submit
7. **Lihat console logs:**
   ```
   [Review Submit] Current authenticated user: syahri@gmail.com Role: USER User ID: <uuid>
   [Review Submit] Review created successfully. User in response: syahri@gmail.com
   ```
   
   **Jika logs menunjukkan servisnih, berarti:**
   - Token yang disimpan adalah untuk servisnih, bukan syahri
   - Ada masalah dengan login atau token management

### Step 3: Verify Token
Di console, jalankan:
```javascript
localStorage.getItem('token')
```
Akan menampilkan JWT token. Buka https://jwt.io dan paste token di sana.

Di section "Decoded" - "Payload", cari field `user_id`. 
Verify bahwa `user_id` itu milik syahri, bukan servisnih.

### Step 4: Check Debug Endpoint
Setelah login as syahri, buka tab baru:
```
http://127.0.0.1:8000/api/umkm-reviews/debug-auth-user/
```

Response harus menunjukkan:
```json
{
  "authenticated": true,
  "email": "syahri@gmail.com",
  "role": "USER",
  "user_id": "..."
}
```

**Jika menunjukkan servisnih**, berarti token Anda adalah untuk servisnih, bukan syahri.

## 🐛 Kemungkinan Penyebab & Solusi

### Penyebab 1: Salah Logout/Login
**Gejala:** Token menunjukkan servisnih
**Solusi:**
```javascript
// Di browser console
localStorage.clear()
```
Refresh halaman, login ulang sebagai syahri dengan email: syahri@gmail.com

### Penyebab 2: Duplicate Account Registration
**Gejala:** syahri@gmail.com registered 2x (sekali sebagai USER, sekali sebagai OWNER)
**Solusi:** 
1. Check dengan diagnostic script
2. Jika ada duplicate, delete akun yang salah di database
3. Register ulang jika perlu

### Penyebab 3: Token Expiration
**Gejala:** Token sudah expired (lebih dari 2 jam)
**Solusi:** Login ulang

### Penyebab 4: Session Conflict
**Gejala:** Multiple tabs open dengan login account berbeda
**Solusi:** Close semua tabs kecuali satu, clear cache, login ulang

## 📊 Checklist Troubleshooting

- [ ] Run diagnostic_script.py, share hasil
- [ ] Clear cache & localStorage (Ctrl+Shift+Delete)
- [ ] Login ulang as syahri
- [ ] Check browser console logs saat submit review
- [ ] Verify token di jwt.io menunjukkan syahri's user_id
- [ ] Call debug endpoint - verify email shown
- [ ] Submit review lagi, check console logs
- [ ] Share semua console logs dan endpoint responses

## 🎯 Expected Behavior (Setelah Fix)

1. **Login as syahri (USER)**
   ```
   Email: syahri@gmail.com
   Role: USER
   ```

2. **Navigate to UMKM detail**
   - Debug endpoint shows: email: syahri@gmail.com

3. **Submit review**
   - Console shows: syahri@gmail.com sebagai reviewer
   - Review muncul dengan: 
     - Name/Email: syahri@gmail.com
     - Role: USER

4. **Other user submit review**
   - Same process - review shows with correct user who submitted it

## 🔧 Technical Details

### JWT Token Structure
Token harus decrypt to:
```json
{
  "user_id": "<syahri's uuid>",
  "email": "syahri@gmail.com",
  "role": "USER"
}
```

### Request Flow
```
Frontend (syahri login)
  ↓
Token saved in localStorage
  ↓
Submit review with token in Authorization header
  ↓
Backend receives request with token
  ↓
JWT authentication decodes token → request.user = syahri
  ↓
perform_create saves: review.user = request.user (syahri) ✓
  ↓
Review saved with correct user
```

## 📝 Log Files

Logs akan appear di Django server output dengan format:
```
[UMKMReview] Review being created by user: syahri@gmail.com (ID: xxx) with role: USER
[UMKMReview] Review xxx successfully created for user syahri@gmail.com
```

Jika logged user adalah servisnih, issue ada pada token/authentication level.

---

**Next Action:** Run diagnostic_script.py dan bagikan hasil. Dari sana kita bisa identify penyebab yang tepat.
