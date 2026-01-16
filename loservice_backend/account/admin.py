from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
	model = User
	list_display = ("email", "username", "role", "is_active", "is_staff", "date_joined", "last_login")
	list_filter = ("role", "is_staff", "is_superuser", "is_active")
	ordering = ("email",)
	search_fields = ("email", "username", "name", "user_id")
	readonly_fields = ("user_id", "date_joined", "last_login", "created_at", "update_at")

	fieldsets = (
		(None, {"fields": ("email", "password", "user_id")}),
		("Personal info", {"fields": ("username", "name", "role")}),
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


