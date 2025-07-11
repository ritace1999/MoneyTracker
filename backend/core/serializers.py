from rest_framework import serializers
from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth import get_user_model
from .models import (
    Transaction,
    ForecastResult,
    CategorizedTransaction,
    UserProfile,
)

User = get_user_model()

# Transaction Serializer
class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = ['user']
        extra_kwargs = {'user': {'required': False}}

# Forecast Result Serializer
class ForecastResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = ForecastResult
        fields = '__all__'

# Categorized Transaction Serializer
class CategorizedTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategorizedTransaction
        fields = '__all__'

# User Profile Serializer (optional but useful)
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['monthly_budget']

# Registration Serializer
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user

class BudgetUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['monthly_budget']