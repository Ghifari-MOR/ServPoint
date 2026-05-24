import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.utils import timezone


# ==========================
# CUSTOM USER (Admin, Owner, User)
# ==========================

class User(AbstractUser):
    user_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # username bawaan AbstractUser tetap ada
    # password bawaan AbstractUser juga sudah ada (hashed)

    name = models.CharField(max_length=100, blank=True)
    email = models.EmailField(unique=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)

    ROLE_CHOICES = (
        ("ADMIN", "Admin"),
        ("OWNER", "Owner"),
        ("USER", "User"),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="USER")

    created_at = models.DateTimeField(auto_now_add=True)
    update_at = models.DateTimeField(auto_now=True)

    # Login pakai email
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]  # supaya saat createsuperuser, username tetap diminta

    def __str__(self):
        return f"{self.email} ({self.role})"


# ==========================
# KATEGORI
# ==========================

class Kategori(models.Model):
    kategori_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nama_kategori = models.CharField(max_length=100, unique=True)
    deskripsi = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.nama_kategori


# ==========================
# UMKM
# ==========================

class UMKM(models.Model):
    umkm_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # relasi ke user (OWNER)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="umkm",
    )
    kategori = models.ForeignKey(
        Kategori,
        on_delete=models.SET_NULL,
        null=True,
        related_name="umkm",
    )
    nama_umkm = models.TextField()
    deskripsi = models.CharField(max_length=255)
    telpon = models.TextField()
    total_views = models.PositiveIntegerField(default=0)
    unique_visitors = models.PositiveIntegerField(default=0)
    whatsapp_clicks = models.PositiveIntegerField(default=0)

    STATUS_CHOICES = (
        ("PENDING", "Pending"),
        ("APPROVED", "Approved"),
        ("REJECTED", "Rejected"),
    )
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default="PENDING")
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_umkm",
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    update_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nama_umkm


class UMKMVisit(models.Model):
    visit_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    umkm = models.ForeignKey(UMKM, on_delete=models.CASCADE, related_name="visit_logs")
    visitor_key = models.CharField(max_length=64)
    visit_date = models.DateField(default=timezone.localdate)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["umkm", "visitor_key", "visit_date"], name="unique_umkm_visitor_per_day"),
        ]
        indexes = [
            models.Index(fields=["umkm", "visit_date"]),
        ]

    def __str__(self):
        return f"Visit {self.umkm_id} {self.visitor_key} {self.visit_date}"


# ==========================
# UMKM BRANCH
# ==========================

class UMKMBranch(models.Model):
    branch_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    umkm = models.ForeignKey(
        UMKM,
        on_delete=models.CASCADE,
        related_name="branches",
    )
    # pemilik / user yang jaga cabang
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="branches",
    )
    alamat = models.TextField()
    telpon = models.CharField(max_length=50)
    geom = models.JSONField()  # bisa diganti PointField jika pakai PostGIS
    
    # Jam Operasional
    jam_buka = models.CharField(max_length=10, default="08:00")  # Format: HH:MM
    jam_tutup = models.CharField(max_length=10, default="20:00")  # Format: HH:MM
    hari_operasional = models.CharField(max_length=50, default="Senin - Sabtu")
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Branch {self.umkm.nama_umkm}"


# ==========================
# UMKM IMAGES
# ==========================

class UMKMImages(models.Model):
    kategori_ID = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nama_kategori = models.ForeignKey(
        Kategori,
        on_delete=models.CASCADE,
        related_name="images",
    )
    image_url = models.TextField()
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.image_url)


# ==========================
# SEARCH LOG
# ==========================

class SearchLog(models.Model):
    search_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="search_logs",
    )
    kategori = models.ForeignKey(
        Kategori,
        on_delete=models.SET_NULL,
        null=True,
        related_name="search_logs",
    )
    keyword = models.CharField(max_length=255)
    timestamp = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.keyword}"


# ==========================
# AUTH SESSION
# ==========================

class AuthSession(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="auth_sessions",
    )
    name = models.UUIDField(default=uuid.uuid4)
    token = models.TextField()
    expired_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Session {self.user.email}"


# ==========================
# AUDIT LOG
# ==========================

class AuditLog(models.Model):
    log_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="audit_logs",
    )
    umkm = models.ForeignKey(
        UMKM,
        on_delete=models.CASCADE,
        related_name="audit_logs",
    )
    aksi = models.CharField(max_length=100)
    deskripsi = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.aksi} oleh {self.user.email}"
    

# Tambahkan di models.py

# Service/Jasa UMKM
class UMKMService(models.Model):
    service_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    umkm = models.ForeignKey(UMKM, on_delete=models.CASCADE, related_name="services")
    nama_service = models.CharField(max_length=200)
    deskripsi = models.TextField()
    harga_min = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    harga_max = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    estimasi_waktu = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

# Produk UMKM
class UMKMProduct(models.Model):
    product_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    umkm = models.ForeignKey(UMKM, on_delete=models.CASCADE, related_name="products")
    nama_produk = models.CharField(max_length=200)
    harga = models.DecimalField(max_digits=12, decimal_places=2)
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    image_url = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

# Review/Ulasan
class UMKMReview(models.Model):
    review_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    umkm = models.ForeignKey(UMKM, on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.IntegerField(default=5)  # 1-5
    comment = models.TextField()
    reply = models.TextField(blank=True, null=True)  # Owner's reply
    reply_at = models.DateTimeField(blank=True, null=True)  # Reply timestamp
    created_at = models.DateTimeField(auto_now_add=True)

# Gallery/Foto UMKM
class UMKMGallery(models.Model):
    gallery_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    umkm = models.ForeignKey(UMKM, on_delete=models.CASCADE, related_name="gallery")
    image = models.ImageField(upload_to='gallery/', null=True, blank=True)
    image_url = models.TextField(blank=True)
    is_primary = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        # Jika ada file image, gunakan image
        # Jika tidak, gunakan image_url
        super().save(*args, **kwargs)