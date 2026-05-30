from rest_framework import serializers, viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission
from rest_framework.response import Response
from django.db.models import Q, F
from rest_framework.views import APIView
from django.utils import timezone
from django.contrib.auth import get_user_model
from urllib.parse import urlparse
from urllib.request import Request, urlopen
import hashlib
import json
import re
import logging
import os

logger = logging.getLogger(__name__)

from .models import Kategori, UMKM, UMKMService, UMKMProduct, UMKMGallery, UMKMReview, UMKMVisit
from .serializer import (
    KategoriSerializer, UMKMSerializer, UserSerializer, UMKMServiceSerializer,
    UMKMProductSerializer, UMKMGallerySerializer, UMKMReviewSerializer, ProfilePictureUploadSerializer
)


CATEGORY_FILTER_ALIASES = {
    'Handphone': {'Handphone', 'Smartphone & HP', 'Smarthphone & HP'},
    'Laptop & PC': {'Laptop & PC', 'PC&Laptop', 'PC & Laptop'},
}


def resolve_category_filter_names(category_name):
    value = (category_name or '').strip()
    if not value:
        return set()

    lowered = value.lower()
    for canonical, aliases in CATEGORY_FILTER_ALIASES.items():
        if lowered == canonical.lower() or lowered in {alias.lower() for alias in aliases}:
            return aliases

    return {value}

User = get_user_model()


class IsOwnerOrAdminForWrite(BasePermission):
    """Allow public read, authenticated create, and OWNER/ADMIN update/delete."""
    message = "Anda tidak memiliki izin untuk melakukan action ini."

    def has_permission(self, request, view):
        # Allow GET, HEAD, OPTIONS for everyone (public read)
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True

        # Allow authenticated users to create UMKM so USER can be promoted on success
        if request.method == "POST":
            if not request.user or not request.user.is_authenticated:
                self.message = "Anda harus login terlebih dahulu."
                return False
            return True
        
        # For write operations, require authentication
        if not request.user or not request.user.is_authenticated:
            self.message = "Anda harus login terlebih dahulu."
            return False

        # Allow staff and superuser
        if getattr(request.user, "is_staff", False) or getattr(request.user, "is_superuser", False):
            return True

        # Allow OWNER and ADMIN roles
        role = getattr(request.user, "role", "")
        role_upper = str(role).upper() if role else ""
        
        if role_upper not in {"OWNER", "ADMIN"}:
            self.message = f"Role Anda adalah '{role}', sementara hanya OWNER atau ADMIN yang dapat melakukan ini."
            return False
            
        return True


class IsAdminForRead(BasePermission):
    """Only admin/staff can list all users."""
    message = "Hanya admin yang dapat mengakses resource ini."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Allow staff and superuser
        if getattr(request.user, "is_staff", False) or getattr(request.user, "is_superuser", False):
            return True
        
        # Allow ADMIN role
        role = str(getattr(request.user, "role", "")).upper()
        return role == "ADMIN"


class IsAdminForKategoriWrite(BasePermission):
    """Public read access for kategori, but only admin/staff can create/update/delete."""
    message = "Hanya admin yang dapat menambah, mengubah, atau menghapus kategori."

    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True

        if not request.user or not request.user.is_authenticated:
            self.message = "Anda harus login terlebih dahulu."
            return False

        if getattr(request.user, "is_staff", False) or getattr(request.user, "is_superuser", False):
            return True

        role = str(getattr(request.user, "role", "")).upper()
        return role == "ADMIN"


class IsAuthenticatedForUserEndpoint(BasePermission):
    """Allow authenticated users to access their own profile, admin can access all."""
    message = "Anda harus login untuk mengakses endpoint ini."

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Allow user to access/modify their own profile
        if obj.user_id == request.user.user_id:
            return True
        
        # Allow admin/staff to access any profile
        if getattr(request.user, "is_staff", False) or getattr(request.user, "is_superuser", False):
            return True
        
        role = str(getattr(request.user, "role", "")).upper()
        return role == "ADMIN"


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet untuk CRUD user.
    - GET: Only admin/staff can list all users, regular user can only see themselves
    - PATCH/PUT: User hanya bisa update data diri sendiri
    - DELETE: User hanya bisa delete akun sendiri
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticatedForUserEndpoint]
    # Use UUID-based lookup to avoid collisions between custom list-level
    # actions (e.g. /users/upload-profile-picture/) and the detail route
    # which uses a catch-all pattern. This prevents strings like
    # 'upload-profile-picture' from being interpreted as a user PK.
    lookup_field = "user_id"
    lookup_value_regex = r"[0-9a-f\-]+"
    
    def get_queryset(self):
        is_staff = getattr(self.request.user, "is_staff", False)
        is_superuser = getattr(self.request.user, "is_superuser", False)
        role = str(getattr(self.request.user, "role", "")).upper()
        
        # Hanya staff/superuser yang bisa lihat semua user
        can_view_all = is_staff or is_superuser or role == "ADMIN"
        
        if not can_view_all:
            # Non-admin hanya bisa lihat data diri sendiri
            return User.objects.filter(user_id=self.request.user.user_id)
        
        queryset = User.objects.all().order_by("-created_at")
        
        # Filter berdasarkan role jika ada
        role_filter = self.request.query_params.get("role", "").strip().upper()
        if role_filter in {"ADMIN", "OWNER", "USER"}:
            queryset = queryset.filter(role=role_filter)
        
        # Search by name or email
        q = self.request.query_params.get("q", "").strip()
        if q:
            queryset = queryset.filter(
                Q(name__icontains=q) | Q(email__icontains=q) | Q(username__icontains=q)
            )
        
        return queryset
    
    def get_serializer_context(self):
        """Add request to serializer context for building absolute URLs"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def update(self, request, *args, **kwargs):
        """Only allow users to update their own profile"""
        instance = self.get_object()
        
        # Check if user is updating their own profile or is admin
        is_staff = getattr(request.user, "is_staff", False)
        is_superuser = getattr(request.user, "is_superuser", False)
        
        if instance.user_id != request.user.user_id and not (is_staff or is_superuser):
            return Response(
                {'error': 'Anda hanya bisa mengubah profil Anda sendiri'},
                status=403
            )
        
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Only allow users to delete their own account or admin can delete any (except other admins)"""
        instance = self.get_object()
        
        # Check if user is deleting their own account or is admin
        is_staff = getattr(request.user, "is_staff", False)
        is_superuser = getattr(request.user, "is_superuser", False)
        
        # Prevent deleting admin accounts
        if str(instance.role).upper() == "ADMIN":
            return Response(
                {'error': 'Tidak dapat menghapus akun Admin'},
                status=403
            )
        
        if instance.user_id != request.user.user_id and not (is_staff or is_superuser):
            return Response(
                {'error': 'Anda hanya bisa menghapus akun Anda sendiri'},
                status=403
            )
        
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=["post"], url_path="upload-profile-picture", permission_classes=[IsAuthenticated])
    def upload_profile_picture(self, request):
        """Upload profile picture for the authenticated user"""
        user = request.user
        serializer = ProfilePictureUploadSerializer(user, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["get"], url_path="count")
    def count(self, request):
        """Return count of users by role"""
        is_staff = getattr(request.user, "is_staff", False)
        is_superuser = getattr(request.user, "is_superuser", False)
        role = str(getattr(request.user, "role", "")).upper()
        
        can_view = is_staff or is_superuser or role == "ADMIN"
        if not can_view:
            return Response({"detail": "Tidak memiliki izin"}, status=403)
        
        from django.db.models import Count
        counts = User.objects.values('role').annotate(count=Count('role'))
        
        result = {
            "total": User.objects.count(),
            "by_role": {item['role']: item['count'] for item in counts}
        }
        return Response(result)


class UMKMServiceViewSet(viewsets.ModelViewSet):
    serializer_class = UMKMServiceSerializer
    permission_classes = [IsOwnerOrAdminForWrite]
    
    def get_queryset(self):
        queryset = UMKMService.objects.select_related('umkm').order_by('-created_at')
        
        # Filter by UMKM ID
        umkm_id = self.request.query_params.get('umkm_id')
        if umkm_id:
            queryset = queryset.filter(umkm_id=umkm_id)
        
        return queryset
    
    def get_serializer_context(self):
        """Add request to serializer context for building absolute URLs"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def perform_create(self, serializer):
        # Get UMKM from request data
        umkm_id = self.request.data.get('umkm')
        if not umkm_id:
            raise serializers.ValidationError({"umkm": "UMKM ID diperlukan"})
        
        try:
            umkm = UMKM.objects.get(umkm_id=umkm_id)
        except UMKM.DoesNotExist:
            raise serializers.ValidationError({"umkm": "UMKM tidak ditemukan"})
        
        # Verify ownership
        if umkm.user != self.request.user and not (self.request.user.is_staff or self.request.user.is_superuser):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Anda tidak memiliki izin untuk menambah service ke UMKM ini")
        
        logger.info(f'[CREATE SERVICE] User: {self.request.user.email}, UMKM: {umkm.nama_umkm}, Service: {self.request.data.get("nama_service")}')
        serializer.save(umkm=umkm)


class UMKMProductViewSet(viewsets.ModelViewSet):
    serializer_class = UMKMProductSerializer
    permission_classes = [IsOwnerOrAdminForWrite]
    
    def get_queryset(self):
        queryset = UMKMProduct.objects.select_related('umkm').order_by('-created_at')
        
        # Filter by UMKM ID
        umkm_id = self.request.query_params.get('umkm_id')
        if umkm_id:
            queryset = queryset.filter(umkm_id=umkm_id)
        
        return queryset
    
    def get_serializer_context(self):
        """Add request to serializer context for building absolute URLs"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def perform_create(self, serializer):
        # Get UMKM from request data
        umkm_id = self.request.data.get('umkm')
        if not umkm_id:
            raise serializers.ValidationError({"umkm": "UMKM ID diperlukan"})
        
        try:
            umkm = UMKM.objects.get(umkm_id=umkm_id)
        except UMKM.DoesNotExist:
            raise serializers.ValidationError({"umkm": "UMKM tidak ditemukan"})
        
        # Verify ownership
        if umkm.user != self.request.user and not (self.request.user.is_staff or self.request.user.is_superuser):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Anda tidak memiliki izin untuk menambah produk ke UMKM ini")
        
        logger.info(f'[CREATE PRODUCT] User: {self.request.user.email}, UMKM: {umkm.nama_umkm}, Produk: {self.request.data.get("nama_produk")}')
        serializer.save(umkm=umkm)


class UMKMGalleryViewSet(viewsets.ModelViewSet):
    serializer_class = UMKMGallerySerializer
    permission_classes = [IsOwnerOrAdminForWrite]

    def _get_request_value(self, *keys):
        """Return the first non-empty request value matching any provided key, case-insensitively."""
        data = self.request.data
        lower_map = {str(key).lower(): key for key in data.keys()}

        for key in keys:
            if key in data and str(data.get(key)).strip():
                return data.get(key)

            match = lower_map.get(str(key).lower())
            if match and str(data.get(match)).strip():
                return data.get(match)

        return None
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def get_queryset(self):
        queryset = UMKMGallery.objects.select_related('umkm').order_by('-is_primary', '-uploaded_at')
        
        # Filter by UMKM ID
        umkm_id = self.request.query_params.get('umkm_id')
        if umkm_id:
            queryset = queryset.filter(umkm_id=umkm_id)
        
        return queryset
    
    def perform_create(self, serializer):
        # Get UMKM from request data
        umkm_id = self._get_request_value('umkm', 'UMKM', 'umkm_id', 'UMKM_ID')
        if not umkm_id:
            raise serializers.ValidationError({"umkm": "UMKM ID diperlukan"})
        
        try:
            umkm = UMKM.objects.get(umkm_id=umkm_id)
        except UMKM.DoesNotExist:
            raise serializers.ValidationError({"umkm": "UMKM tidak ditemukan"})
        
        # Verify ownership
        if umkm.user != self.request.user and not (self.request.user.is_staff or self.request.user.is_superuser):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Anda tidak memiliki izin untuk menambah foto ke UMKM ini")
        
        serializer.save(umkm=umkm)


class UMKMReviewViewSet(viewsets.ModelViewSet):
    serializer_class = UMKMReviewSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = UMKMReview.objects.select_related('user', 'umkm').all()
        umkm_id = self.request.query_params.get('umkm_id')
        if umkm_id:
            queryset = queryset.filter(umkm_id=umkm_id)
        return queryset.order_by('-created_at')
    
    def get_serializer_context(self):
        """Add request to serializer context for building absolute URLs in nested UserSerializer"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def _is_admin(self, user):
        return bool(getattr(user, 'is_staff', False) or getattr(user, 'is_superuser', False) or str(getattr(user, 'role', '')).upper() == 'ADMIN')

    def _can_edit_review(self, review, user):
        return review.user_id == getattr(user, 'user_id', None) or self._is_admin(user)

    def _can_delete_review(self, review, user):
        if self._is_admin(user):
            return True

        if review.user_id == getattr(user, 'user_id', None):
            return True

        return review.umkm.user_id == getattr(user, 'user_id', None)

    def update(self, request, *args, **kwargs):
        review = self.get_object()
        if not self._can_edit_review(review, request.user):
            return Response(
                {'error': 'Anda hanya bisa mengedit ulasan milik Anda sendiri'},
                status=403,
            )
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        review = self.get_object()
        if not self._can_edit_review(review, request.user):
            return Response(
                {'error': 'Anda hanya bisa mengedit ulasan milik Anda sendiri'},
                status=403,
            )
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        review = self.get_object()
        if not self._can_delete_review(review, request.user):
            return Response(
                {'error': 'Anda tidak memiliki izin untuk menghapus ulasan ini'},
                status=403,
            )
        return super().destroy(request, *args, **kwargs)
    
    def perform_create(self, serializer):
        # Explicitly verify authenticated user and log the action
        user = self.request.user
        
        # Validate authentication
        if not user or not user.is_authenticated:
            logger.error('[UMKMReview] Create attempt without authentication')
            raise Response(
                {'error': 'User tidak terautentikasi. Silakan login terlebih dahulu.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Log who is creating the review
        logger.info(f'[UMKMReview] Review being created by user: {getattr(user, "email", "<anon>")} (ID: {getattr(user, "user_id", "?")}) with role: {getattr(user, "role", None)}')

        # Server-side validation: prevent owners from posting reviews on their own UMKM
        umkm = serializer.validated_data.get('umkm')
        try:
            umkm_owner_id = getattr(umkm.user, 'user_id', None)
        except Exception:
            umkm_owner_id = None

        if umkm_owner_id and umkm_owner_id == getattr(user, 'user_id', None) and not self._is_admin(user):
            from rest_framework.exceptions import PermissionDenied
            logger.warning(f'[UMKMReview] User {getattr(user, "email", "?")} attempted to review own UMKM {getattr(umkm, "umkm_id", "?")}')
            raise PermissionDenied('Anda tidak dapat mengirim ulasan ke toko Anda sendiri')

        # Save review with authenticated user
        review = serializer.save(user=user)

        logger.info(f'[UMKMReview] Review {getattr(review, "review_id", "?")} successfully created for user {getattr(user, "email", "?")}')
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def debug_auth_user(self, request):
        """Debug endpoint to check authenticated user"""
        user = request.user
        return Response({
            'authenticated': user.is_authenticated,
            'user_id': str(user.user_id) if hasattr(user, 'user_id') else None,
            'email': user.email,
            'username': user.username,
            'name': user.name if hasattr(user, 'name') else None,
            'role': user.role if hasattr(user, 'role') else None,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
        })
    
    @action(detail=True, methods=['post'], url_path='reply')
    def add_reply(self, request, pk=None):
        """Add owner reply to a review"""
        review = self.get_object()
        umkm = review.umkm
        
        # Check if user is the owner of the UMKM
        if umkm.user != request.user and not request.user.is_staff:
            return Response(
                {'error': 'Hanya pemilik UMKM yang dapat membalas ulasan'},
                status=403
            )
        
        reply_text = request.data.get('reply', '').strip()
        if not reply_text:
            return Response(
                {'error': 'Balasan tidak boleh kosong'},
                status=400
            )
        
        review.reply = reply_text
        review.reply_at = timezone.now()
        review.save()
        
        serializer = self.get_serializer(review)
        return Response(serializer.data)


class KategoriViewSet(viewsets.ModelViewSet):
    queryset = Kategori.objects.all().order_by("nama_kategori")
    serializer_class = KategoriSerializer
    permission_classes = [IsAdminForKategoriWrite]


class UMKMViewSet(viewsets.ModelViewSet):
    serializer_class = UMKMSerializer
    permission_classes = [IsOwnerOrAdminForWrite]

    def get_queryset(self):
        queryset = (
            UMKM.objects.all()
            .select_related("user", "kategori")
            .prefetch_related("branches", "gallery")
            .order_by("-created_at")
        )

        # Check if user is authenticated
        is_authenticated = self.request.user and self.request.user.is_authenticated
        
        if not is_authenticated:
            # Anonymous users can only see approved UMKM
            queryset = queryset.filter(status="APPROVED")
        else:
            role = str(getattr(self.request.user, "role", "")).upper()
            is_staff = getattr(self.request.user, "is_staff", False)
            is_superuser = getattr(self.request.user, "is_superuser", False)
            
            # User dengan is_staff atau is_superuser bisa lihat semua UMKM
            can_manage_all = is_staff or is_superuser or role == "ADMIN"
            
            if can_manage_all:
                # Bisa filter berdasarkan status untuk verifikasi
                status_param = (self.request.query_params.get("status") or "").strip().upper()
                if status_param in {"PENDING", "APPROVED", "REJECTED"}:
                    queryset = queryset.filter(status=status_param)
            elif role == "OWNER":
                # Owner hanya lihat UMKM milik sendiri
                queryset = queryset.filter(user=self.request.user)
            else:
                # User biasa hanya lihat yang approved
                queryset = queryset.filter(status="APPROVED")

        q = (self.request.query_params.get("q") or "").strip()
        if q:
            queryset = queryset.filter(
                Q(nama_umkm__icontains=q)
                | Q(deskripsi__icontains=q)
                | Q(telpon__icontains=q)
                | Q(kategori__nama_kategori__icontains=q)
                | Q(user__email__icontains=q)
                | Q(user__name__icontains=q)
                | Q(services__nama_service__icontains=q)
                | Q(services__deskripsi__icontains=q)
                | Q(products__nama_produk__icontains=q)
            )
            queryset = queryset.distinct()

        # Filter by kategori if provided
        kategori = (self.request.query_params.get("kategori") or "").strip()
        if kategori:
            queryset = queryset.filter(kategori__nama_kategori__in=resolve_category_filter_names(kategori))

        return queryset

    def get_serializer_context(self):
        """Add request to serializer context for building absolute URLs"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    @action(detail=False, methods=["get"], url_path="suggestions", permission_classes=[AllowAny])
    def suggestions(self, request, *args, **kwargs):
        q = (request.query_params.get("q") or "").strip()
        if len(q) < 2:
            return Response([])

        limit = 8
        seen = set()
        suggestions = []

        def add_suggestion(label, kind, umkm=None, source_id=None):
            key = (kind, label.lower())
            if not label or key in seen:
                return
            seen.add(key)
            suggestions.append({
                "label": label,
                "type": kind,
                "umkm_id": str(getattr(umkm, "umkm_id", "")) if umkm else None,
                "umkm_name": getattr(umkm, "nama_umkm", None) if umkm else None,
                "source_id": str(source_id) if source_id else None,
            })

        umkm_matches = (
            UMKM.objects.filter(
                Q(status="APPROVED")
                & (
                    Q(nama_umkm__icontains=q)
                    | Q(deskripsi__icontains=q)
                    | Q(telpon__icontains=q)
                    | Q(kategori__nama_kategori__icontains=q)
                    | Q(services__nama_service__icontains=q)
                    | Q(services__deskripsi__icontains=q)
                    | Q(products__nama_produk__icontains=q)
                )
            )
            .select_related("kategori")
            .distinct()[:limit]
        )

        for umkm in umkm_matches:
            add_suggestion(umkm.nama_umkm, "UMKM", umkm=umkm)

        service_matches = (
            UMKMService.objects.filter(
                Q(nama_service__icontains=q) | Q(deskripsi__icontains=q)
            )
            .select_related("umkm")
            .order_by("nama_service")[:limit]
        )
        for service in service_matches:
            add_suggestion(service.nama_service, "LAYANAN", umkm=service.umkm, source_id=service.service_id)

        product_matches = (
            UMKMProduct.objects.filter(nama_produk__icontains=q)
            .select_related("umkm")
            .order_by("nama_produk")[:limit]
        )
        for product in product_matches:
            add_suggestion(product.nama_produk, "PRODUK", umkm=product.umkm, source_id=product.product_id)

        return Response(suggestions[:limit])

    def _visitor_key(self, request):
        key = (request.data.get('visitor_key') or '').strip()
        if key:
            return key[:64]

        forwarded_for = (request.META.get('HTTP_X_FORWARDED_FOR') or '').split(',')[0].strip()
        remote_addr = (forwarded_for or request.META.get('REMOTE_ADDR') or 'anonymous').strip()
        user_agent = (request.META.get('HTTP_USER_AGENT') or '').strip()
        raw = f'{remote_addr}|{user_agent}'
        return hashlib.sha1(raw.encode('utf-8')).hexdigest()

    @action(detail=True, methods=["post"], url_path="track-view", permission_classes=[AllowAny])
    def track_view(self, request, *args, **kwargs):
        umkm = self.get_object()
        visitor_key = self._visitor_key(request)
        visit_date = timezone.localdate()

        visit, created = UMKMVisit.objects.get_or_create(
            umkm=umkm,
            visitor_key=visitor_key,
            visit_date=visit_date,
        )

        UMKM.objects.filter(pk=umkm.pk).update(total_views=F('total_views') + 1)
        if created:
            UMKM.objects.filter(pk=umkm.pk).update(unique_visitors=F('unique_visitors') + 1)

        umkm.refresh_from_db(fields=['total_views', 'unique_visitors'])
        return Response({
            'detail': 'view tracked',
            'umkm_id': str(umkm.umkm_id),
            'total_views': umkm.total_views,
            'unique_visitors': umkm.unique_visitors,
            'visit_date': str(visit.visit_date),
        })

    @action(detail=True, methods=["post"], url_path="track-whatsapp", permission_classes=[AllowAny])
    def track_whatsapp(self, request, *args, **kwargs):
        umkm = self.get_object()
        UMKM.objects.filter(pk=umkm.pk).update(whatsapp_clicks=F('whatsapp_clicks') + 1)
        umkm.refresh_from_db(fields=['whatsapp_clicks'])
        return Response({
            'detail': 'whatsapp tracked',
            'umkm_id': str(umkm.umkm_id),
            'whatsapp_clicks': umkm.whatsapp_clicks,
        })

    @action(detail=True, methods=["post"], url_path="approve")
    def approve(self, request, *args, **kwargs):
        is_staff = getattr(request.user, "is_staff", False)
        is_superuser = getattr(request.user, "is_superuser", False)
        role = str(getattr(request.user, "role", "")).upper()
        
        print(f"[APPROVE DEBUG] user={request.user.email}, is_staff={is_staff}, is_superuser={is_superuser}, role='{role}'")
        
        # Hanya staff/superuser yang bisa approve
        can_approve = is_staff or is_superuser or role == "ADMIN"
        
        if not can_approve:
            error_msg = f"Anda tidak memiliki izin untuk menyetujui UMKM. (role={role}, is_staff={is_staff}, is_superuser={is_superuser})"
            print(f"[APPROVE DEBUG] Permission denied: {error_msg}")
            return Response({"detail": error_msg}, status=403)

        umkm = self.get_object()
        umkm.status = "APPROVED"
        umkm.reviewed_by = request.user
        umkm.reviewed_at = timezone.now()
        umkm.save(update_fields=["status", "reviewed_by", "reviewed_at", "update_at"])
        return Response(self.get_serializer(umkm).data)

    @action(detail=True, methods=["post"], url_path="reject")
    def reject(self, request, *args, **kwargs):
        is_staff = getattr(request.user, "is_staff", False)
        is_superuser = getattr(request.user, "is_superuser", False)
        role = str(getattr(request.user, "role", "")).upper()
        
        # Hanya staff/superuser yang bisa reject
        can_reject = is_staff or is_superuser or role == "ADMIN"
        
        if not can_reject:
            return Response({"detail": "Anda tidak memiliki izin untuk menolak UMKM."}, status=403)

        umkm = self.get_object()
        umkm.status = "REJECTED"
        umkm.reviewed_by = request.user
        umkm.reviewed_at = timezone.now()
        umkm.save(update_fields=["status", "reviewed_by", "reviewed_at", "update_at"])
        return Response(self.get_serializer(umkm).data)

    @action(detail=False, methods=["patch"], url_path="admin-update")
    def admin_update(self, request, *args, **kwargs):
        umkm_id = (request.data.get("umkm_id") or request.query_params.get("umkm_id") or "").strip()
        if not umkm_id:
            return Response({"detail": "umkm_id wajib diisi"}, status=400)

        try:
            umkm = UMKM.objects.select_related("user", "kategori").prefetch_related("branches", "gallery").get(umkm_id=umkm_id)
        except UMKM.DoesNotExist:
            return Response({"detail": "UMKM tidak ditemukan"}, status=404)

        serializer = self.get_serializer(umkm, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ReverseGeocodeView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        lat = (request.query_params.get("lat") or "").strip()
        lng = (request.query_params.get("lng") or "").strip()

        try:
            latitude = float(lat)
            longitude = float(lng)
        except (TypeError, ValueError):
            return Response({"detail": "Koordinat tidak valid"}, status=status.HTTP_400_BAD_REQUEST)

        address = self._reverse_geocode(latitude, longitude)
        if not address:
            return Response({"detail": "Alamat tidak ditemukan"}, status=status.HTTP_404_NOT_FOUND)

        return Response({"address": address})

    def _reverse_geocode(self, latitude, longitude):
        google_api_key = os.getenv("VITE_GOOGLE_MAPS_API_KEY") or os.getenv("GOOGLE_MAPS_API_KEY")

        if google_api_key:
            try:
                google_url = (
                    "https://maps.googleapis.com/maps/api/geocode/json"
                    f"?latlng={latitude},{longitude}&key={google_api_key}&language=id"
                )
                with urlopen(Request(google_url, headers={"User-Agent": "ServPoint/1.0"}), timeout=8) as resp:
                    google_data = json.loads(resp.read().decode("utf-8"))
                results = google_data.get("results") or []
                if results:
                    first_result = results[0]
                    components = first_result.get("address_components") or []
                    structured_address = self._format_google_components(components)
                    if structured_address:
                        return structured_address
            except Exception as exc:
                logger.warning("Google reverse geocoding failed: %s", exc)

        try:
            osm_url = (
                "https://nominatim.openstreetmap.org/reverse"
                f"?format=jsonv2&lat={latitude}&lon={longitude}&zoom=18&addressdetails=1"
            )
            with urlopen(Request(osm_url, headers={"User-Agent": "ServPoint/1.0", "Accept-Language": "id"}), timeout=8) as resp:
                osm_data = json.loads(resp.read().decode("utf-8"))
            return osm_data.get("display_name") or ""
        except Exception as exc:
            logger.warning("OpenStreetMap reverse geocoding failed: %s", exc)
            return ""

    def _get_component(self, components, preferred_types):
        for target_type in preferred_types:
            for component in components:
                if target_type in (component.get("types") or []):
                    return (component.get("long_name") or "").strip()
        return ""

    def _format_google_components(self, components):
        route = self._get_component(components, ["route"])
        street_number = self._get_component(components, ["street_number"])

        if route.lower().startswith("jalan "):
            route = f"Jl. {route[6:]}"
        elif route and not route.lower().startswith("jl."):
            route = f"Jl. {route}"

        street_part = ""
        if route and street_number:
            street_part = f"{route} No.{street_number}"
        elif route:
            street_part = route
        elif street_number:
            street_part = f"No.{street_number}"

        kelurahan = self._get_component(components, ["sublocality_level_3", "administrative_area_level_4"])

        kecamatan = self._get_component(components, ["sublocality_level_2", "administrative_area_level_3"])
        if kecamatan and not kecamatan.lower().startswith("kec."):
            kecamatan = f"Kec. {kecamatan}"

        city = self._get_component(components, ["administrative_area_level_2", "locality"])
        if city:
            lower_city = city.lower()
            if not (lower_city.startswith("kota ") or lower_city.startswith("kabupaten ")):
                city = f"Kota {city}"

        province = self._get_component(components, ["administrative_area_level_1"])
        postal_code = self._get_component(components, ["postal_code"])
        province_postal = " ".join(part for part in [province, postal_code] if part)

        parts = [street_part, kelurahan, kecamatan, city, province_postal]
        return ", ".join(part for part in parts if part)

    def destroy(self, request, *args, **kwargs):
        # Hanya superuser yang bisa delete (via Django admin saja)
        is_superuser = getattr(request.user, "is_superuser", False)
        if not is_superuser:
            return Response({"detail": "Hanya superuser yang dapat menghapus UMKM."}, status=403)
        return super().destroy(request, *args, **kwargs)


class UMKMAdminUpdateView(APIView):
    permission_classes = [IsOwnerOrAdminForWrite]

    def patch(self, request):
        umkm_id = (request.data.get("umkm_id") or "").strip()
        if not umkm_id:
            return Response({"detail": "umkm_id wajib diisi"}, status=400)

        try:
            umkm = UMKM.objects.select_related("user", "kategori").prefetch_related("branches", "gallery").get(umkm_id=umkm_id)
        except UMKM.DoesNotExist:
            return Response({"detail": "UMKM tidak ditemukan"}, status=404)

        serializer = UMKMSerializer(umkm, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ParseMapsUrlView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        url = (request.data.get("url") or "").strip()
        if not url:
            return Response({"detail": "url wajib diisi"}, status=400)

        def _expand_shortlink(u: str) -> str:
            try:
                parsed = urlparse(u)
                host = (parsed.netloc or "").lower()
                if host not in {"maps.app.goo.gl", "goo.gl"}:
                    return u
                req = Request(u, headers={"User-Agent": "Mozilla/5.0"})
                with urlopen(req, timeout=6) as resp:
                    return resp.geturl() or u
            except Exception:
                return u

        def _extract_lat_lng(u: str):
            s = _expand_shortlink(u.strip())

            m = re.search(r"@\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)", s)
            if m:
                return float(m.group(1)), float(m.group(2)), s

            m = re.search(r"[?&]q=\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)", s)
            if m:
                return float(m.group(1)), float(m.group(2)), s

            m = re.search(r"[?&]query=\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)", s)
            if m:
                return float(m.group(1)), float(m.group(2)), s

            m = re.search(r"[?&]ll=\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)", s)
            if m:
                return float(m.group(1)), float(m.group(2)), s

            m = re.search(r"!3d\s*(-?\d+(?:\.\d+)?)!4d\s*(-?\d+(?:\.\d+)?)", s)
            if m:
                return float(m.group(1)), float(m.group(2)), s

            return None

        result = _extract_lat_lng(url)
        if result:
            lat, lng, expanded = result
            return Response({"latitude": lat, "longitude": lng, "expanded_url": expanded})
        else:
            return Response({"detail": "Tidak dapat mengekstrak koordinat dari URL"}, status=400)