from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, RegisterOwnerView, LoginView, MeView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("register-owner/", RegisterOwnerView.as_view(), name="register_owner"),
    path("login/", LoginView.as_view(), name="login"),
    path("me/", MeView.as_view(), name="me"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
