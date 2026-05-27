# VPS Deployment Fix

Kalau di VPS muncul error seperti `fatal: not a git repository` atau `npm ERR! enoent /root/package.json`, artinya perintah dijalankan di folder yang salah. Biasanya kamu masih berada di `/root`, bukan di folder project.

## 1. Cari folder project yang benar

Jalankan ini di VPS:

```bash
pwd
find / -maxdepth 3 \( -name .git -o -name package.json -o -name manage.py \) 2>/dev/null
```

Pilih folder yang berisi file project, lalu masuk ke folder itu.

## 2. Update source code

```bash
cd /path/ke/folder-project
git remote -v
git pull origin main
```

## 3. Build frontend

```bash
cd loservice_frontend
npm install
npm run build
```

## 4. Restart service

Kalau backend memakai systemd, cek nama servicenya dulu:

```bash
systemctl list-units --type=service | grep -i gunicorn
```

Lalu restart service yang aktif:

```bash
sudo systemctl restart gunicorn_servpoint
sudo systemctl reload nginx
```

## 5. Verifikasi

```bash
git log -1 --oneline
ls -la loservice_frontend/dist
```

Kalau `git log -1` belum menunjukkan commit terbaru, berarti VPS belum berada di repo yang benar atau belum di-pull.

## Catatan

- `npm run build` harus dijalankan di folder `loservice_frontend`, bukan di `/root`.
- Kalau kamu memakai folder berbeda di VPS, ganti `/path/ke/folder-project` dengan lokasi yang benar.
- Kalau frontend diserve dari build lama, pastikan nginx mengarah ke `loservice_frontend/dist` yang terbaru.