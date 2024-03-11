
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('image_loader/', include('image_loader.urls')),
    path('', include('frontend.urls'))
]
