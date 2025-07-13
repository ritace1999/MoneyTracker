from django.urls import path, include
from rest_framework import routers
from . import views
from .views import RegisterView, TransactionListCreateView
from .views import explain_classification_html
from .views import SummaryAnalyticsView
from .views import MonthlyStatsView 
from .views import ExportCSVView, ExportPDFView
from .views import budget_alert_view
from .views import update_budget
from django.urls import path
from .views import request_password_reset, reset_password

router = routers.DefaultRouter()
router.register(r'transactions', views.TransactionViewSet)
router.register(r'forecast-results', views.ForecastResultViewSet)
router.register(r'categorized-transactions', views.CategorizedTransactionViewSet)

urlpatterns = [
    path('', views.redirect_to_api),
    path('predict/', views.predict_category),
    path('classify-transaction/', views.classify_transaction),
    path('forecast/', views.forecast_expenses),
    path('xai/', views.explain_classification),
    path('classify-and-save/', views.classify_and_save_transaction),
    path('register/', RegisterView.as_view(), name='register'),
    # path('transactions/', TransactionListCreateView.as_view(), name='transaction-list-create'),
    path('', include(router.urls)),
    path('xai/html/', explain_classification_html, name='explain-classification-html'),
    path('summary/', SummaryAnalyticsView.as_view(), name='summary-analytics'),
    path('monthly/stats/', MonthlyStatsView.as_view(), name='monthly-stats'),
    path('export/pdf/', ExportPDFView.as_view(), name='export-pdf'),
    path('export/csv/', ExportCSVView.as_view(), name='export-csv'),
    path('budget/alert/', budget_alert_view),
    path('budget/update/', update_budget, name='update-budget'),
    path("password-reset/", request_password_reset),
    path("password-reset-confirm/", reset_password),

]
