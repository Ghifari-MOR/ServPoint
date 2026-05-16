# INSTRUKSI CEPAT: Test Issue Review User

## QUICK TEST (Langsung lakukan ini sekarang)

### 1. Clear Cache & Login Ulang
```
1. Buka browser, tekan Ctrl+Shift+Delete
2. Pilih "All time", klik "Clear data"
3. Refresh halaman atau close tab
4. Login ulang dengan email: syahri@gmail.com
5. Pastikan tampilan role adalah USER (bukan OWNER)
```

### 2. Cek Console Log
```
1. Tekan F12 (buka DevTools)
2. Ke tab "Console"
3. Lihat ada log tidak? Jika tidak ada, clear:
   - localStorage.clear() (paste di console tekan Enter)
   - location.reload()
4. Login ulang as syahri
5. Go ke detail UMKM
6. Klik "Tulis Ulasan"
7. Isi dan submit ulasan
8. **PERHATIAN**: Lihat di console, ada log seperti ini?
   ```
   [Review Submit] Current authenticated user: syahri@gmail.com
   [Review Submit] Review created successfully. User in response: syahri@gmail.com
   ```
```

### 3. Cek Token di JWT.io
```
1. Buka Console (F12)
2. Copy-paste ini di console tekan Enter:
   localStorage.getItem('token')
3. Copy hasil (panjang string)
4. Buka https://jwt.io
5. Paste di "Encoded" box
6. Lihat bagian "Decoded" - "Payload"
7. Cari field "user_id" 
8. Itu harusnya ID unik milik syahri, bukan servisnih
```

### 4. Cek Debug Endpoint
```
1. Login as syahri (pastikan sudah login dengan benar)
2. Buka tab baru
3. Paste URL ini: http://127.0.0.1:8000/api/umkm-reviews/debug-auth-user/
4. Tekan Enter
5. Lihat response JSON
6. Field "email" harus "syahri@gmail.com" bukan "servisnih@gmail.com"
```

## LAPORKAN INI
```
Jika test selesai, laporkan:
1. Hasil console logs (screenshot atau copy-paste)
2. Token user_id dari jwt.io (format: "user_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx")
3. Response dari debug endpoint (copy-paste JSON)
4. Apakah ulasan yang tersubmit sekarang menampilkan syahri atau masih servisnih?
```

## Jika Review Masih Salah
```
Kemungkinan penyebab dari hasil di atas:
1. Console logs menunjukkan "servisnih@gmail.com" 
   → Token Anda adalah untuk servisnih, bukan syahri
   → Harus clear localStorage dan login ulang dengan BENAR
   
2. jwt.io menunjukkan user_id milik servisnih
   → Sama, token salah. Login ulang.
   
3. Debug endpoint menunjukkan "servisnih@gmail.com"
   → Sama lagi. Login ulang dengan cara:
      - Clear cache (Ctrl+Shift+Delete)
      - Clear localStorage (buka console: localStorage.clear())
      - Close semua browser tab
      - Open browser baru
      - Login as syahri
```

## Jika Review Sudah BENAR
```
Jika sekarang review menampilkan "syahri@gmail.com" dengan benar:
1. Test submit 2-3 ulasan lagi untuk confirm
2. Test dengan user lain juga (jika ada)
3. Semua harus menampilkan user yang benar
4. Masalah sudah fixed! ✓
```

---

**PENTING**: Jangan lanjut ke step kompleks sampai clear cache dan login ulang dulu!
Sering kali issue ini terjadi karena token lama yang cached.
