# core/filters.py

import django_filters
from .models import Transaction

class TransactionFilter(django_filters.FilterSet):
    start_date = django_filters.DateFilter(field_name="date", lookup_expr='gte', label="Start date")
    end_date = django_filters.DateFilter(field_name="date", lookup_expr='lte', label="End date")
    
    category = django_filters.CharFilter(field_name="category", lookup_expr='icontains', label="Category")
    description = django_filters.CharFilter(field_name="description", lookup_expr='icontains', label="Description")

    min_amount = django_filters.NumberFilter(field_name="amount", lookup_expr='gte', label="Min Amount")
    max_amount = django_filters.NumberFilter(field_name="amount", lookup_expr='lte', label="Max Amount")

    class Meta:
        model = Transaction
        fields = ['category', 'description', 'start_date', 'end_date', 'min_amount', 'max_amount']
