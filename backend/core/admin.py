from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    Transaction,
    ForecastResult,
    CategorizedTransaction,
    CustomUser,
    UserProfile,
)

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ("username", "email", "monthly_budget", "is_staff", "is_active")
    list_filter = ("is_staff", "is_active")
    fieldsets = UserAdmin.fieldsets + (
        ("Extra Fields", {"fields": ("monthly_budget", "profile_picture")}),
    )

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "monthly_budget")

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ("user", "amount", "category", "date", "created_at")
    list_filter = ("category", "date")
    search_fields = ("description",)

@admin.register(ForecastResult)
class ForecastResultAdmin(admin.ModelAdmin):
    list_display = ("user", "forecast_date", "predicted_amount")

@admin.register(CategorizedTransaction)
class CategorizedTransactionAdmin(admin.ModelAdmin):
    list_display = ("user", "predicted_category", "confidence")
