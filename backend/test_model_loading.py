import os
import pickle
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences

# === Setup ===
BASE_DIR = os.path.join(os.path.dirname(__file__), 'core', 'ml')

# === Load BiRNN model ===
model_path = os.path.join(BASE_DIR, 'BiRNN.h5')
model = load_model(model_path)
print("BiRNN model loaded.")

# === Load tokenizer ===
tokenizer_path = os.path.join(BASE_DIR, 'tokenizer.pkl')
with open(tokenizer_path, 'rb') as f:
    tokenizer = pickle.load(f)
print("Tokenizer loaded.")

# === Load label encoder ===
label_encoder_path = os.path.join(BASE_DIR, 'label_encoder.pkl')
with open(label_encoder_path, 'rb') as f:
    label_encoder = pickle.load(f)
print(" Label encoder loaded.")

# === Run a test prediction ===
test_text = "buy milk and eggs"
sequence = tokenizer.texts_to_sequences([test_text])
padded = pad_sequences(sequence, maxlen=100)  # adjust if needed
prediction = model.predict(padded)
predicted_class = label_encoder.inverse_transform([np.argmax(prediction)])

print("\n🎯 Prediction Test Successful!")
print(f"Input Text: {test_text}")
print(f"Predicted Category: {predicted_class[0]}")
