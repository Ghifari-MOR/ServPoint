# Deploy ke Railway

Railway adalah platform PaaS yang sangat mudah untuk deploy aplikasi Django + React. Berikut adalah langkah-langkah deploymentnya:

## Persiapan

### 1. Install Railway CLI (Optional, tapi recommended)
```bash
npm i -g @railway/cli
# atau download dari https://railway.app
```

### 2. Buat akun Railway
- Buka https://railway.app
- Sign up dengan GitHub (recommended)
- Verify email

## Deploy Backend Django

### Langkah 1: Push ke GitHub
```bash
cd c:\LOKATOR SERVCE LAPTOP
git init
git add .
git commit -m "Initial commit - production ready"
git remote add origin https://github.com/yourusername/loservice.git
git push -u origin main
```

### Langkah 2: Connect GitHub ke Railway
1. Login ke Railway dashboard: https://railway.app/dashboard
2. Klik "Create New Project"
3. Pilih "Deploy from GitHub repo"
4. Authorize Railway to access GitHub
5. Select repository: `yourusername/loservice`
6. Railway akan auto-detect Django project

### Langkah 3: Configure Django Service
1. Railway akan membuat service untuk backend
2. Di Railway dashboard, buka project settings
3. Set environment variables:
   ```
   DEBUG=False
   SECRET_KEY=your-very-secret-key-here
   ```

### Langkah 4: Add PostgreSQL Database
1. Di Railway dashboard, klik "Add a Database"
2. Select "PostgreSQL"
3. Railway akan otomatis set `DATABASE_URL` environment variable
4. Django akan otomatis menggunakan PostgreSQL

### Langkah 5: Run Django Migrations
1. Di Railway dashboard, buka the Django service
2. Go to "Deployments" tab
3. Klik latest deployment
4. Buka "Shell" tab
5. Run migrations:
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```

   Atau jalankan setup script:
   ```bash
   python setup_production.py
   ```

### Langkah 6: Collect Static Files
Railway akan otomatis run `collectstatic` jika ada Procfile.

## Deploy Frontend React

### Langkah 1: Build React App (Sudah done)
```bash
npm run build
# Output: dist/ folder dengan optimized assets
```

### Langkah 2: Add Frontend Service ke Railway
1. Di Railway dashboard, klik "Add Service"
2. Select "GitHub"
3. Select repository yang sama
4. Railway akan auto-detect package.json

### Langkah 3: Configure Frontend Service
1. Set build command: `npm run build`
2. Set start command: `npm run preview` (atau gunakan server statis)
3. Set PORT environment variable: `3000`

### Langkah 4: Serve Static Files
Ada beberapa pilihan:
- **Option A**: Gunakan Railway's built-in static file serving
- **Option B**: Deploy ke separate service (Vercel, Netlify)
- **Option C**: Serve dari Django (buat symbolic link ke dist/)

**Recommended: Option B - Deploy React ke Vercel (FREE)**

## Deploy React ke Vercel (Recommended)

### Langkah 1: Push React ke GitHub
```bash
git add loservice_frontend/
git commit -m "Add React production build"
git push
```

### Langkah 2: Deploy ke Vercel
1. Buka https://vercel.com
2. Sign in dengan GitHub
3. Klik "Import Project"
4. Select `yourusername/loservice` repository
5. Vercel akan auto-detect Vite config
6. Set build settings:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
7. Click Deploy

### Langkah 3: Configure CORS
1. Vercel akan memberikan URL: `https://yourapp.vercel.app`
2. Update Django settings CORS:
   ```python
   CORS_ALLOWED_ORIGINS = [
       'https://yourapp.vercel.app',
   ]
   ```
3. Push ke GitHub, Railway akan auto-redeploy

## Testing Production

### 1. Test Backend API
```bash
curl https://your-backend.railway.app/api/auth/login/
```

### 2. Test Frontend
Buka: `https://yourapp.vercel.app`

### 3. Test File Uploads
1. Login ke admin panel
2. Upload profile picture
3. Verify file tersimpan di Railway storage

## Custom Domain Setup

### Add Custom Domain ke Railway (Backend)
1. Railway Dashboard → Project Settings
2. Click "Domains"
3. Add custom domain: `api.yourdomain.com`
4. Update DNS records dengan Railway's nameservers

### Add Custom Domain ke Vercel (Frontend)
1. Vercel Dashboard → Project Settings
2. Click "Domains"
3. Add custom domain: `yourdomain.com` atau `www.yourdomain.com`
4. Update DNS records

### Update Django Settings
```python
ALLOWED_HOSTS = [
    'api.yourdomain.com',
    '*.railway.app',
]

CORS_ALLOWED_ORIGINS = [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
]
```

## Monitoring & Logs

### Railway Logs
1. Dashboard → Select Project → Select Service
2. Click "Logs" tab
3. Real-time logs dari Django

### Environment Variables
1. Dashboard → Project Settings → Variables
2. Update SECRET_KEY, DEBUG, dll

## Common Issues

### 1. Database Connection Error
```
Error: could not connect to server
```
**Solution**: Check DATABASE_URL is set correctly in Railway dashboard

### 2. Static Files Not Loading
```
404 /static/admin/...
```
**Solution**: Run `python manage.py collectstatic --noinput`

### 3. CORS Error di Frontend
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**: Update CORS_ALLOWED_ORIGINS di settings.py dengan frontend domain

### 4. File Upload Not Working
```
No such file or directory: /app/media/...
```
**Solution**: 
- For temporary files: OK di Railway (will be deleted on redeployment)
- For permanent storage: Use S3 atau Railway's volume storage

## Rollback Deployment

Jika ada error setelah deploy:
1. Railway Dashboard → Deployments tab
2. Click previous working deployment
3. Click "Revert to this deployment"

## Cost Estimation

- **Railway**: $5/month untuk small project (included: 1 Django service + 1 PostgreSQL database)
- **Vercel**: FREE tier (with some limitations)
- **Total**: ~$5/month untuk production!

## Done! 🎉

Aplikasi sudah live di production. Monitor logs di Railway dashboard dan Vercel untuk memastikan semuanya berjalan lancar.
