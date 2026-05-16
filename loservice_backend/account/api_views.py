from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission
from rest_framework.response import Response
from django.db.models import Q
from rest_framework.views import APIView
from django.utils import timezone
from django.contrib.auth import get_user_model
from urllib.parse import urlparse
from urllib.request import Request, urlopen
import re
import logging

logger = logging.getLogger(__name__)

from .models import Kategori, UMKM, UMKMService, UMKMProduct, UMKMGallery, UMKMReview
from .serializer import (
    KategoriSerializer, UMKMSerializer, UserSerializer, UMKMServiceSerializer,
    UMKMProductSerializer, UMKMGallerySerializer, UMKMReviewSerializer
)

User = get_user_model()


class IsOwnerOrAdminForWrite(BasePermission):
    """Allow anyone to read; only authenticated OWNER/ADMIN can write."""
    message = "Anda tidak memiliki izin untuk melakukan action ini. Role Anda harus OWNER atau ADMIN."

    def has_permission(self, request, view):
        # Allow GET, HEAD, OPTIONS for everyone (public read)
        if request.method in ("GET", "HEAD", "OPTIONS"):
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
        logger.info(f'[UMKMReview] Review being created by user: {user.email} (ID: {user.user_id}) with role: {user.role}')
        
        # Save review with authenticated user
        review = serializer.save(user=user)
        
        logger.info(f'[UMKMReview] Review {review.review_id} successfully created for user {user.email}')
    
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


class KategoriViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Kategori.objects.all().order_by("nama_kategori")
    serializer_class = KategoriSerializer
    permission_classes = [AllowAny]


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
            )

        # Filter by kategori if provided
        kategori = (self.request.query_params.get("kategori") or "").strip()
        if kategori:
            queryset = queryset.filter(kategori__nama_kategori__iexact=kategori)

        return queryset

    def get_serializer_context(self):
        """Add request to serializer context for building absolute URLs"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

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

    def destroy(self, request, *args, **kwargs):
        # Hanya superuser yang bisa delete (via Django admin saja)
        is_superuser = getattr(request.user, "is_superuser", False)
        if not is_superuser:
            return Response({"detail": "Hanya superuser yang dapat menghapus UMKM."}, status=403)
        return super().destroy(request, *args, **kwargs)


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