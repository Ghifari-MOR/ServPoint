from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import Owner, Kategori, UMKM, UMKMBranch, UMKMImages, SearchLog, AuthSession, AuditLog


@admin.register(Owner)
class OwnerAdmin(DjangoUserAdmin):
	model = Owner
	list_display = ("email", "username", "role", "is_active", "is_staff", "date_joined", "last_login")
	list_filter = ("role", "is_staff", "is_superuser", "is_active")
	ordering = ("email",)
	search_fields = ("email", "username", "name", "user_id")
	readonly_fields = ("user_id", "date_joined", "last_login", "created_at", "update_at")

	fieldsets = (
		(None, {"fields": ("email", "password", "user_id")}),
		("Personal info", {"fields": ("username", "name", "role", "password_hash")}),
		("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
		("Important dates", {"fields": ("last_login", "date_joined", "created_at", "update_at")}),
	)

	add_fieldsets = (
		(
			None,
			{
				"classes": ("wide",),
				"fields": ("email", "username", "name", "role", "password1", "password2"),
			},
		),
	)


@admin.register(Kategori)
class KategoriAdmin(admin.ModelAdmin):
	list_display = ("nama_kategori",)
	search_fields = ("nama_kategori",)


@admin.register(UMKM)
class UMKMAdmin(admin.ModelAdmin):
	list_display = ("nama_umkm", "user", "kategori", "created_at")
	search_fields = ("nama_umkm", "user__email", "user__username")
	list_filter = ("kategori",)


@admin.register(UMKMBranch)
class UMKMBranchAdmin(admin.ModelAdmin):
	list_display = ("umkm", "user", "alamat")
	search_fields = ("umkm__nama_umkm", "user__email")


@admin.register(UMKMImages)
class UMKMImagesAdmin(admin.ModelAdmin):
	list_display = ("nama_kategori", "image_url", "uploaded_at")
	search_fields = ("nama_kategori__nama_kategori",)


@admin.register(SearchLog)
class SearchLogAdmin(admin.ModelAdmin):
	list_display = ("keyword", "user", "kategori", "timestamp")
	search_fields = ("keyword", "user__email")
	list_filter = ("kategori",)


@admin.register(AuthSession)
class AuthSessionAdmin(admin.ModelAdmin):
	list_display = ("user", "name", "created_at", "expired_at")
	search_fields = ("user__email",)


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
	list_display = ("aksi", "user", "umkm", "timestamp")
	search_fields = ("aksi", "user__email", "umkm__nama_umkm")
