from rest_framework.routers import DefaultRouter
from django.urls import path

from .api_views import (
    KategoriViewSet, 
    UMKMViewSet, 
    ParseMapsUrlView, 
    UserViewSet,
    UMKMServiceViewSet,
    UMKMProductViewSet,
    UMKMGalleryViewSet,
    UMKMReviewViewSet  # TAMBAHKAN INI
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
    path("utils/parse-maps/", ParseMapsUrlView.as_view(), name="parse_maps"),
]