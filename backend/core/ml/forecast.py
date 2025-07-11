from datetime import datetime
from django.db.models import Sum
from django.db.models.functions import TruncMonth
from core.models import Transaction
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA

def get_monthly_expense_forecast(user):
    try:
        # Aggregate user's transaction data by month
        qs = Transaction.objects.filter(user=user).annotate(
            month=TruncMonth('date')
        ).values('month').annotate(total=Sum('amount')).order_by('month')

        df = pd.DataFrame(list(qs))
        if df.empty or len(df) < 6:
            raise ValueError("❌ At least 6 months of transaction data required for forecasting.")

        df.set_index('month', inplace=True)
        df.index = pd.to_datetime(df.index)
        df = df.asfreq('MS')

        model = ARIMA(df['total'], order=(1, 1, 1))
        fitted_model = model.fit()
        forecast = fitted_model.forecast(steps=4)

        forecast_months = pd.date_range(df.index[-1] + pd.offsets.MonthBegin(1), periods=4, freq='MS')
        forecast_dict = dict(zip(forecast_months.strftime('%b %Y'), forecast.round(2).tolist()))

        return forecast_dict

    except Exception as e:
        return {"error": str(e)}
