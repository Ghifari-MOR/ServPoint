from rest_framework.routers import DefaultRouter
from django.urls import path

from .api_views import (
    KategoriViewSet, 
    UMKMViewSet, 
    UMKMAdminUpdateView,
    ParseMapsUrlView, 
    UserViewSet,
    UMKMServiceViewSet,
    UMKMProductViewSet,
    UMKMGalleryViewSet,
    UMKMReviewViewSet,  # TAMBAHKAN INI
    ReverseGeocodeView,
)

router = DefaultRouter()
router.register(r"kategori", KategoriViewSet, basename="kategori")
router.register(r"umkm", UMKMViewSet, basename="umkm")
router.register(r"users", UserViewSet, basename="users")
router.register(r"umkm-services", UMKMServiceViewSet, basename="umkm-services")
router.register(r"umkm-products", UMKMProductViewSet, basename="umkm-products")
router.register(r"umkm-gallery", UMKMGalleryViewSet, basename="umkm-gallery")
router.register(r"umkm-reviews", UMKMReviewViewSet, basename="umkm-reviews")  # TAMBAHKAN INI

urlpatterns = router.urls + [
    path("umkm/admin-update/", UMKMAdminUpdateView.as_view(), name="umkm-admin-update"),
    path("utils/parse-maps/", ParseMapsUrlView.as_view(), name="parse_maps"),
    path("utils/reverse-geocode/", ReverseGeocodeView.as_view(), name="reverse_geocode"),
]