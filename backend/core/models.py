from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser

# Custom User Model
class CustomUser(AbstractUser):
    monthly_budget = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)

    def __str__(self):
        return self.username

# User Profile
class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    monthly_budget = models.FloatField(default=0.0)

    def __str__(self):
        return f"{self.user.username}'s Profile"

# Transaction Model
class Transaction(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    amount = models.FloatField()
    description = models.TextField()
    category = models.CharField(max_length=100, blank=True, null=True)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.amount} - {self.category}"

# Forecast Result Model
class ForecastResult(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    forecast_date = models.DateField()
    predicted_amount = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.forecast_date} - {self.predicted_amount}"

# Categorized Transaction
class CategorizedTransaction(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    transaction = models.OneToOneField(Transaction, on_delete=models.CASCADE, related_name='categorized', null=True, blank=True)


    predicted_category = models.CharField(max_length=100)
    confidence = models.FloatField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} - {self.predicted_category}"
