from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import random
from core.models import Transaction, CustomUser

class Command(BaseCommand):
    help = 'Seed the database with 6 months of dummy transactions for forecasting.'

    def handle(self, *args, **kwargs):
        try:
            user = CustomUser.objects.first()  # Use first user in DB
            if not user:
                self.stdout.write(self.style.ERROR("❌ No user found. Please register a user first."))
                return

            Transaction.objects.filter(user=user).delete()  # Optional: clear old data

            categories = ['Food', 'Travel', 'Utilities', 'Entertainment', 'Health']
            today = timezone.now().date()

            for i in range(6):  # 6 months
                for _ in range(5):  # 5 transactions per month
                    date = today - timedelta(days=30 * i + random.randint(0, 10))
                    Transaction.objects.create(
                        user=user,
                        amount=round(random.uniform(50, 300), 2),
                        description=f"Dummy {random.choice(categories)} expense",
                        category=random.choice(categories),
                        date=date
                    )

            self.stdout.write(self.style.SUCCESS(" 30 dummy transactions created over 6 months."))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Error: {str(e)}"))
