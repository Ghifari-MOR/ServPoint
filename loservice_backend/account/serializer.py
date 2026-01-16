from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
import re
from urllib.parse import urlparse
from urllib.request import Request, urlopen

from .models import Kategori, UMKM, UMKMBranch, UMKMService, UMKMProduct, UMKMGallery, UMKMReview

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True, required=False)
    password_confirm = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            "user_id",
            "email",
            "username",
            "name",
            "role",
            "password",
            "password2",
            "password_confirm",
        ]
        read_only_fields = ["user_id"]
        extra_kwargs = {
            "password": {"write_only": True},
            "password2": {"write_only": True},
            "password_confirm": {"write_only": True},
            "username": {"required": False, "allow_blank": True},
            "name": {"required": False, "allow_blank": True},
            "role": {"required": False},
        }

    def validate(self, attrs):
        # normalisasi role: terima lower/Title, simpan uppercase sesuai choices
        role = attrs.get("role", "USER")
        if role:
            attrs["role"] = str(role).upper()
        valid_roles = {choice[0] for choice in User.ROLE_CHOICES}
        if attrs["role"] not in valid_roles:
            raise serializers.ValidationError("Role harus salah satu dari: ADMIN, OWNER, USER")

        # alias password_confirm -> password2
        if attrs.get("password_confirm") and not attrs.get("password2"):
            attrs["password2"] = attrs["password_confirm"]

        if attrs.get("password") != attrs.get("password2"):
            raise serializers.ValidationError("Password tidak sama.")
        validate_password(attrs["password"])
        return attrs

    def create(self, validated_data):
        validated_data.pop("password2", None)
        validated_data.pop("password_confirm", None)
        username = validated_data.pop("username", None) or validated_data.get("email")
        if not validated_data.get("name"):
            validated_data["name"] = ""
        
        # Create user
        user = User.objects.create_user(username=username, **validated_data)
        
        # Auto-set permissions for ADMIN role
        if user.role == "ADMIN":
            user.is_staff = True
            user.is_superuser = True
            user.save()
        
        return user


class UserSerializer(serializers.ModelSerializer):
    profile_picture_url = serializers.SerializerMethodField()
    profile_picture = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = User
        fields = ["user_id", "email", "username", "name", "role", "profile_picture", "profile_picture_url"]
        read_only_fields = ["user_id", "role", "profile_picture_url"]
    
    def get_profile_picture_url(self, obj):
        if obj.profile_picture:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_picture.url)
        return None
    
    def update(self, instance, validated_data):
        """Handle profile picture upload on update"""
        profile_picture = validated_data.pop('profile_picture', None)
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Handle profile picture separately
        if profile_picture is not None:
            instance.profile_picture = profile_picture
        
        instance.save()
        return instance


class KategoriSerializer(serializers.ModelSerializer):
    class Meta:
        model = Kategori
        fields = ["kategori_id", "nama_kategori", "deskripsi"]


class UMKMBranchSerializer(serializers.ModelSerializer):
    # Add default values for fields that might not exist yet
    jam_buka = serializers.CharField(required=False, default="08:00")
    jam_tutup = serializers.CharField(required=False, default="20:00")
    hari_operasional = serializers.CharField(required=False, default="Senin - Sabtu")
    
    class Meta:
        model = UMKMBranch
        fields = ["branch_id", "alamat", "telpon", "geom", "jam_buka", "jam_tutup", "hari_operasional", "created_at"]
        read_only_fields = ["branch_id", "created_at"]
    
    def to_representation(self, instance):
        """Handle cases where fields don't exist yet (before migration)"""
        ret = super().to_representation(instance)
        
        # Safely get operating hours fields with defaults
        ret['jam_buka'] = getattr(instance, 'jam_buka', '08:00')
        ret['jam_tutup'] = getattr(instance, 'jam_tutup', '20:00')
        ret['hari_operasional'] = getattr(instance, 'hari_operasional', 'Senin - Sabtu')
        
        return ret


class UMKMServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UMKMService
        fields = ['service_id', 'umkm', 'nama_service', 'deskripsi', 'harga_min', 'harga_max', 'estimasi_waktu', 'created_at']
        read_only_fields = ['service_id', 'created_at']


class UMKMProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = UMKMProduct
        fields = ['product_id', 'umkm', 'nama_produk', 'harga', 'image_url', 'created_at']
        read_only_fields = ['product_id', 'created_at']


class UMKMGallerySerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)
    image_url = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = UMKMGallery
        fields = ['gallery_id', 'umkm', 'image', 'image_url', 'is_primary', 'uploaded_at']
        read_only_fields = ['gallery_id', 'uploaded_at']
    
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        # Jika ada image field, gunakan URL dari image
        if instance.image:
            request = self.context.get('request')
            if request:
                rep['image_url'] = request.build_absolute_uri(instance.image.url)
            else:
                rep['image_url'] = instance.image.url
        # Hapus field image dari response (hanya kirim image_url)
        rep.pop('image', None)
        return rep


# TAMBAHKAN INI (setelah UMKMGallerySerializer)
class UMKMReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = UMKMReview
        fields = ['review_id', 'umkm', 'user', 'user_name', 'user_email', 'rating', 'comment', 'reply', 'reply_at', 'created_at']
        read_only_fields = ['review_id', 'user', 'created_at', 'reply_at']


class UMKMSerializer(serializers.ModelSerializer):
    # Allow frontend to submit aliases; model fields are filled in validate()
    nama_umkm = serializers.CharField(required=False, allow_blank=True)
    deskripsi = serializers.CharField(required=False, allow_blank=True)
    telpon = serializers.CharField(required=False, allow_blank=True)

    kategori = KategoriSerializer(read_only=True)
    kategori_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    kategori_name = serializers.CharField(write_only=True, required=False, allow_blank=True)

    # compatibility fields from frontend form
    name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    description = serializers.CharField(write_only=True, required=False, allow_blank=True)
    contact = serializers.CharField(write_only=True, required=False, allow_blank=True)
    category = serializers.CharField(write_only=True, required=False, allow_blank=True)
    address = serializers.CharField(write_only=True, required=False, allow_blank=True)
    maps_url = serializers.CharField(write_only=True, required=False, allow_blank=True)
    latitude = serializers.FloatField(write_only=True, required=False, allow_null=True)
    longitude = serializers.FloatField(write_only=True, required=False, allow_null=True)
    
    # Operating hours fields
    jam_buka = serializers.CharField(write_only=True, required=False, allow_blank=True)
    jam_tutup = serializers.CharField(write_only=True, required=False, allow_blank=True)
    hari_operasional = serializers.CharField(write_only=True, required=False, allow_blank=True)

    # relasi yang di-serialize untuk response
    user = serializers.SerializerMethodField()
    branches = UMKMBranchSerializer(many=True, read_only=True)
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = UMKM
        fields = [
            "umkm_id",
            "user",
            "kategori",
            "kategori_id",
            "kategori_name",
            "nama_umkm",
            "deskripsi",
            "telpon",
            "status",
            "reviewed_by",
            "reviewed_at",
            "created_at",
            "update_at",
            "branches",
            "primary_image",
            # write-only aliases
            "name",
            "description",
            "contact",
            "category",
            "address",
            "maps_url",
            "latitude",
            "longitude",
            "jam_buka",
            "jam_tutup",
            "hari_operasional",
        ]
        read_only_fields = ["umkm_id", "user", "status", "reviewed_by", "reviewed_at", "created_at", "update_at"]

    def get_user(self, obj):
        """Serialize user with context to get profile_picture_url"""
        if obj.user:
            return UserSerializer(obj.user, context=self.context).data
        return None
    
    def get_primary_image(self, obj):
        """Get primary or first gallery image"""
        # Cari foto yang ditandai is_primary
        primary = obj.gallery.filter(is_primary=True).first()
        if primary:
            if primary.image:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(primary.image.url)
                return primary.image.url
            return primary.image_url
        
        # Jika tidak ada primary, ambil foto pertama
        first_image = obj.gallery.first()
        if first_image:
            if first_image.image:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(first_image.image.url)
                return first_image.image.url
            return first_image.image_url
        
        return None

    def validate(self, attrs):
        # Map aliases → model fields
        if attrs.get("name"):
            attrs["nama_umkm"] = attrs.pop("name")
        if attrs.get("description"):
            attrs["deskripsi"] = attrs.pop("description")
        if attrs.get("contact"):
            attrs["telpon"] = attrs.pop("contact")

        # Handle kategori by name or ID
        kategori_name = attrs.pop("category", None) or attrs.pop("kategori_name", None)
        kategori_id = attrs.pop("kategori_id", None)

        if kategori_name:
            kat, _ = Kategori.objects.get_or_create(nama_kategori=kategori_name)
            attrs["kategori"] = kat
        elif kategori_id:
            try:
                kat = Kategori.objects.get(kategori_id=kategori_id)
                attrs["kategori"] = kat
            except Kategori.DoesNotExist:
                raise serializers.ValidationError("Kategori tidak ditemukan")

        return attrs

    def create(self, validated_data):
        # Extract branch data (address, lat, lng, maps_url, operating hours)
        address = validated_data.pop("address", "")
        maps_url = validated_data.pop("maps_url", "")
        latitude = validated_data.pop("latitude", None)
        longitude = validated_data.pop("longitude", None)
        jam_buka = validated_data.pop("jam_buka", "08:00")
        jam_tutup = validated_data.pop("jam_tutup", "20:00")
        hari_operasional = validated_data.pop("hari_operasional", "Senin - Sabtu")

        # Create UMKM
        request = self.context.get("request")
        validated_data["user"] = request.user if request else None
        umkm = UMKM.objects.create(**validated_data)

        # Create default branch
        if address or maps_url or (latitude and longitude):
            geom = None
            if latitude is not None and longitude is not None:
                # Simpan sebagai dict biasa, tidak perlu GDAL/GeoDjango
                geom = {
                    "type": "Point",
                    "coordinates": [float(longitude), float(latitude)]
                }

            UMKMBranch.objects.create(
                umkm=umkm,
                user=request.user if request else umkm.user,
                alamat=address or "",
                telpon=umkm.telpon or "",
                geom=geom,
                jam_buka=jam_buka,
                jam_tutup=jam_tutup,
                hari_operasional=hari_operasional
            )

        return umkm

    def update(self, instance, validated_data):
        # Pop branch-related fields (tidak update di sini, bikin endpoint terpisah kalau perlu)
        validated_data.pop("address", None)
        validated_data.pop("maps_url", None)
        validated_data.pop("latitude", None)
        validated_data.pop("longitude", None)

        # Update UMKM fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance