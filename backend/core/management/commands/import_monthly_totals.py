import os
import pandas as pd
from django.core.management.base import BaseCommand
from core.models import Transaction
from django.contrib.auth.models import User
from datetime import datetime
from django.utils.timezone import make_aware

class Command(BaseCommand):
    help = 'Import transactions from monthly_total.xlsx for forecasting'

    def handle(self, *args, **kwargs):
    try:
        import os
        file_path = os.path.join(os.getcwd(), 'monthly_total.xlsx')
        print(f"📂 Trying to read file at: {file_path}")

        df = pd.read_excel(file_path)
        print(f"✅ File loaded. Columns: {df.columns.tolist()}")
