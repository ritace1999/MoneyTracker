from datetime import datetime
from django.db.models import Sum
from django.db.models.functions import TruncMonth
from core.models import Transaction
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA


def get_monthly_expense_forecast(user):
    try:
        # Step 1: Aggregate user transaction data by month
        qs = Transaction.objects.filter(user=user).annotate(
            month=TruncMonth('date')
        ).values('month').annotate(total=Sum('amount')).order_by('month')

        # Step 2: Convert to pandas DataFrame
        df = pd.DataFrame(list(qs))
        if df.empty or len(df) < 6:
            raise ValueError("At least 6 months of transaction data required for forecasting.")

        # Step 3: Prepare the time series
        df.set_index('month', inplace=True)
        df.index = pd.to_datetime(df.index)
        df = df.asfreq('MS')  # 'MS' = Month Start

        # Step 4: Fit ARIMA model
        model = ARIMA(df['total'], order=(1, 1, 1))
        fitted_model = model.fit()

        # Step 5: Forecast the next 4 months
        forecast = fitted_model.forecast(steps=4)
        forecast_months = pd.date_range(df.index[-1] + pd.offsets.MonthBegin(1), periods=4, freq='MS')

        # Step 6: Convert to list of dicts for frontend compatibility
        forecast_list = [
            {"month": m.strftime('%b %Y'), "forecasted_expense": float(v)}
            for m, v in zip(forecast_months, forecast.round(2))
        ]

        return forecast_list

    except Exception as e:
        return {"error": str(e)}
