# Quick Start: Deploy ke Railway

## ⚡ 5 Langkah Cepat

### 1️⃣ Siapkan GitHub Repository
```bash
cd c:\LOKATOR SERVCE LAPTOP
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/loservice.git
git push -u origin main
```

### 2️⃣ Buat Project di Railway
1. Buka https://railway.app → Dashboard
2. Click "Create New Project" → "Deploy from GitHub"
3. Select repository `yourusername/loservice`
4. Railway auto-detect Django backend ✓

### 3️⃣ Add PostgreSQL Database
1. Click "Add Database" → "PostgreSQL"
2. Railway auto-set `DATABASE_URL` env var ✓

### 4️⃣ Setup Django Production
1. Buka Railway Dashboard → Django Service → "Shell"
2. Run command:
   ```bash
   python manage.py migrate
   python railway_setup.py
   ```

### 5️⃣ Deploy React ke Vercel (FREE)
1. Buka https://vercel.com
2. Click "Import Project" → select `yourusername/loservice`
3. Vercel auto-build React ✓

## ✅ Done!

Backend: `https://your-railway-app.railway.app`
Frontend: `https://your-vercel-app.vercel.app`

---

## 📝 Environment Variables (Railway Dashboard)

Set these in Railway Dashboard → Project Settings → Variables:

```
DEBUG=False
SECRET_KEY=your-secret-key-here
```

(DATABASE_URL is auto-set by Railway when PostgreSQL added)

---

## 🔗 Custom Domain (Optional)

### For Backend (Railway)
1. Railway Dashboard → Project → Domains
2. Add domain: `api.yourdomain.com`
3. Update DNS records

### For Frontend (Vercel)
1. Vercel Dashboard → Project → Settings → Domains
2. Add domain: `yourdomain.com`
3. Update DNS records

---

## 🔧 Update Django Settings for Custom Domain

In `loservice_backend/renamennti_backend/settings.py`:

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

Push to GitHub → Railway auto-redeploy ✓

---

## 📊 Monitor & Logs

- **Railway Logs**: Dashboard → Service → "Logs" tab
- **Vercel Logs**: Dashboard → Project → "Deployments" tab

---

## ❌ Troubleshooting

| Problem | Solution |
|---------|----------|
| Database error | Check DATABASE_URL in Railway env vars |
| CORS error | Update CORS_ALLOWED_ORIGINS in settings.py |
| Static files 404 | Already handled by WhiteNoise middleware |
| File upload fails | Use S3 or ask Railway support for persistent storage |

---

## 💰 Cost: ~$5/month

- Railway: $5/month (small tier, includes Django + PostgreSQL)
- Vercel: FREE
- **Total: ~$5/month**

---

**Need help?** Check [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md) for detailed guide.
