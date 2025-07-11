# MoneyTracker
# MoneyTracker

MoneyTracker is a full-stack personal finance tracking system that helps users monitor their expenses, classify spending categories, visualize monthly trends, and forecast future spending. It uses Django REST Framework for the backend and React.js with Tailwind CSS and Chart.js for the frontend.

---

## Features

- Token-based user authentication (JWT)
- Add/update/delete personal transactions
- Category prediction using ML model (BiRNN)
- Monthly and category-wise spending stats
- Budget alerts and usage progress bar
- Expense forecast using ARIMA model
- LIME/XAI-based explanation for category prediction

---

## Technologies

### Backend:
- Python 3.x
- Django 4+
- Django REST Framework
- SQLite/PostgreSQL
- Pandas, NumPy
- scikit-learn, LIME, ARIMA

### Frontend:
- React.js + Vite
- TypeScript
- Tailwind CSS
- Ant Design
- Axios
- Chart.js

---

money_tracker_backend/
│
├── core/
│   ├── models.py
│   ├── views.py
│   ├── urls.py
│   ├── serializers.py
│   ├── filters.py
│   ├── ml/
│   │   ├── classifier.py
│   │   ├── forecast.py
│   │   └── lime_explainer.py
|
├── manage.py
├── requirements.txt
└── db.sqlite3
```

---

## Setup Instructions

1 create venv

python -m venv venv
source venv/bin/activate # or venv\Scripts\activate

pip install django
pip install djangorestframework
pip install django-filter
pip install -r requirements.txt
pip install lime
pip install stats
pip install tensorflow
pip install numpy
pip install pandas
pip install statsmodels
pip install reportlab

2. Run server

python manage.py migrate
python manage.py runserver

3. Use Postman / Swagger to test endpoints



# Frontend Setup Instructions (React.js)
npm install
npm run dev
Frontend will be available at:
http://localhost:5173


