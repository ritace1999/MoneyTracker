from django.http import HttpResponseRedirect, HttpResponse
from django.utils import timezone
from rest_framework import viewsets, generics, status, permissions, filters
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.views import APIView
from django.db.models import Sum, Value
from django.db.models.functions import Coalesce, TruncMonth
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Transaction
from .serializers import TransactionSerializer

from .models import Transaction, ForecastResult, CategorizedTransaction, UserProfile

from .serializers import (
    RegisterSerializer,
    TransactionSerializer,
    ForecastResultSerializer,
    CategorizedTransactionSerializer,
)

from .filters import TransactionFilter
from .ml.classifier import classify_text
from .ml.forecast import get_monthly_expense_forecast
from .ml.lime_explainer import explain_with_lime

import csv
from reportlab.pdfgen import canvas
import numpy as np
from lime.lime_text import LimeTextExplainer
from .ml.classifier import loaded_model, tokenizer, label_encoder


#.................
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .serializers import BudgetUpdateSerializer

# 1. DRF Views

class TransactionListCreateView(generics.ListCreateAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = TransactionFilter
    search_fields = ['description']
    ordering_fields = ['date', 'amount', 'category']
    ordering = ['-date']

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        instance = serializer.save(user=self.request.user)
        try:
            predicted_category = classify_text(instance.description)
            instance.category = predicted_category
            instance.save()
            CategorizedTransaction.objects.create(
                transaction=instance,
                user=self.request.user,
                predicted_category=predicted_category
            )
        except Exception as e:
            print(f"[ERROR] Classification failed: {e}")



class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        instance = serializer.save(user=self.request.user)
        try:
            predicted_category = classify_text(instance.description)
            instance.category = predicted_category
            instance.save()
            CategorizedTransaction.objects.create(
                transaction=instance,
                user=self.request.user,
                predicted_category=predicted_category
            )
        except Exception as e:
            print(f"[ERROR] Classification failed: {e}")

    def perform_update(self, serializer):
        instance = serializer.save(user=self.request.user)
        try:
            new_category = classify_text(instance.description)
        except Exception:
            new_category = 'Uncategorized'

        instance.category = new_category
        instance.save()

        CategorizedTransaction.objects.update_or_create(
            transaction=instance,
            defaults={
                'user': self.request.user,
                'predicted_category': new_category,
                'confidence': None
            }
        )


class ForecastResultViewSet(viewsets.ModelViewSet):
    queryset = ForecastResult.objects.all()
    serializer_class = ForecastResultSerializer
    permission_classes = [IsAuthenticated]


class CategorizedTransactionViewSet(viewsets.ModelViewSet):
    queryset = CategorizedTransaction.objects.all()
    serializer_class = CategorizedTransactionSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def get_queryset(self):
        return CategorizedTransaction.objects.filter(user=self.request.user)


class SummaryAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # ✅ Use budget from custom user model
        budget = user.monthly_budget or 0

        # ✅ Filter transactions for the current month only
        now = timezone.now()
        month_start = now.replace(day=1)
        transactions = Transaction.objects.filter(user=user, date__gte=month_start)

        # ✅ Total expenses this month
        total_expense = transactions.aggregate(total=Sum('amount'))['total'] or 0

        # ✅ Category-wise breakdown (handle uncategorized)
        expenses_by_category = transactions.annotate(
            display_category=Coalesce('category', Value('Uncategorized'))
        ).values('display_category').annotate(
            total=Sum('amount')
        ).order_by('-total')

        return Response({
            "budget": budget,
            "total_expense": total_expense,
            "expenses_by_category": [
                {"category": entry["display_category"], "total": entry["total"]}
                for entry in expenses_by_category
            ]
        })


class MonthlyStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        monthly_stats = (
            Transaction.objects.filter(user=user)
            .annotate(month=TruncMonth('date'))
            .values('month')
            .annotate(total=Sum('amount'))
            .order_by('month')
        )

        data = [{"month": entry["month"].strftime("%B %Y"), "total": entry["total"]}
                for entry in monthly_stats]

        return Response({"monthly_stats": data})


class ExportCSVView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')
        category = request.GET.get('category')

        transactions = Transaction.objects.filter(user=request.user)
        if start_date:
            transactions = transactions.filter(date__gte=start_date)
        if end_date:
            transactions = transactions.filter(date__lte=end_date)
        if category:
            transactions = transactions.filter(category__iexact=category)

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="transactions.csv"'

        writer = csv.writer(response)
        writer.writerow(['Date', 'Amount', 'Category', 'Description'])
        for txn in transactions:
            writer.writerow([txn.date, txn.amount, txn.category or 'N/A', txn.description])

        return response


class ExportPDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="transactions.pdf"'

        p = canvas.Canvas(response)
        p.setFont("Helvetica-Bold", 14)
        p.drawString(50, 800, f"Transaction Report for {request.user.username}")

        y = 770
        p.setFont("Helvetica-Bold", 12)
        p.drawString(50, y, "Date")
        p.drawString(130, y, "Amount")
        p.drawString(200, y, "Category")
        p.drawString(300, y, "Description")
        y -= 20
        p.setFont("Helvetica", 11)

        transactions = Transaction.objects.filter(user=request.user).order_by('-date')
        for txn in transactions:
            p.drawString(50, y, str(txn.date))
            p.drawString(130, y, f"{txn.amount:.2f}")
            p.drawString(200, y, txn.category if txn.category else "N/A")
            p.drawString(300, y, txn.description[:50])
            y -= 20
            if y < 50:
                p.showPage()
                y = 800
                p.setFont("Helvetica", 11)

        p.save()
        return response


class MonthlyStatisticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        transactions = Transaction.objects.filter(user=user)

        monthly_totals = transactions.annotate(month=TruncMonth('date')).values('month').annotate(total=Sum('amount')).order_by('month')
        category_breakdown = transactions.annotate(month=TruncMonth('date')).values('month', 'category').annotate(total=Sum('amount')).order_by('month', 'category')

        return Response({
            "monthly_totals": list(monthly_totals),
            "monthly_by_category": list(category_breakdown)
        })


# 2. Custom API Views

@api_view(['GET'])
def api_home(request):
    return Response({
        "routes": {
            "/api/classify-transaction/?text=...": "Classify transaction (GET)",
            "/api/classify-and-save/": "Classify and save transaction (POST)",
            "/api/forecast/": "Return forecast",
            "/api/transactions/": "List and create transactions",
            "/api/categorized-transactions/": "Grouped data",
            "/api/xai/": "Explain classification (stub)"
        }
    })


@api_view(['GET'])
def classify_transaction(request):
    text = request.query_params.get('text', '')
    if not text:
        return Response({'error': 'No input provided.'}, status=400)
    try:
        category = classify_text(text)
        return Response({'category': category})
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
def classify_and_save_transaction(request):
    try:
        if not request.user or not request.user.is_authenticated:
            return Response({'error': 'Authentication required.'}, status=401)

        description = request.data.get('description', '')
        amount = request.data.get('amount', None)

        if not description or amount is None:
            return Response({'error': 'Description and amount are required.'}, status=400)

        category = classify_text(description)

        transaction = Transaction.objects.create(
            user=request.user,
            description=description,
            amount=amount,
            category=category,
            date=timezone.now().date()
        )

        serializer = TransactionSerializer(transaction)
        return Response({'message': 'Transaction saved and categorized.', 'data': serializer.data})

    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def forecast_expenses(request):
    try:
        user = request.user
        forecast = get_monthly_expense_forecast(user)  # ✅ Fixed
        return Response({"forecast": forecast})
    except Exception as e:
        return Response({"forecast": {"error": str(e)}})



@api_view(['GET'])
def explain_classification(request):
    text = request.query_params.get('text', '')
    if not text:
        return Response({'error': 'No input provided.'}, status=400)

    try:
        top_features, _ = explain_with_lime(text)
        return Response({
            'input': text,
            'explanation': top_features
        })
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def explain_classification_html(request):
    text = request.query_params.get('text', '')
    if not text:
        return Response({'error': 'No input text provided.'}, status=400)

    class_names = list(label_encoder.classes_)
    explainer = LimeTextExplainer(class_names=class_names)

    def predict_proba(texts):
        sequences = tokenizer.texts_to_sequences(texts)
        padded = tokenizer.sequences_to_matrix(sequences, mode='binary')
        predictions = loaded_model.predict(padded)
        return predictions

    explanation = explainer.explain_instance(text, predict_proba, num_features=10)
    html_data = explanation.as_html()

    return HttpResponse(html_data)

from datetime import date
from calendar import monthrange
from rest_framework.decorators import api_view
from django.db.models import Sum

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def budget_alert_view(request):
    user = request.user
    budget = user.monthly_budget or 0

    today = date.today()
    start_of_month = today.replace(day=1)
    end_of_month = today.replace(day=monthrange(today.year, today.month)[1])

    monthly_expense = Transaction.objects.filter(
        user=user,
        date__gte=start_of_month,
        date__lte=end_of_month
    ).aggregate(total=Sum('amount'))['total'] or 0

    if monthly_expense > budget:
        return Response({
            "status": "Over Budget",
            "spent": round(monthly_expense, 2),
            "budget": round(budget, 2),
            "exceeded_by": round(monthly_expense - budget, 2)
        })
    else:
        return Response({
            "status": "Within Budget",
            "spent": round(monthly_expense, 2),
            "budget": round(budget, 2)
        })


# 3. Root Redirect

def redirect_to_api(request):
    return HttpResponseRedirect('/api/')


from rest_framework.permissions import AllowAny

class RegisterView(APIView):
    permission_classes = [AllowAny]  # 👈 This overrides global auth

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "✅ User registered successfully."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


#....
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_budget(request):
    user = request.user
    serializer = BudgetUpdateSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "✅ Budget updated successfully."})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Legacy alias support
predict_category = classify_transaction
