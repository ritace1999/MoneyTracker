import os
import pickle
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences

# Load model and tokenizers
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, 'BiRNN.h5')
tokenizer_path = os.path.join(BASE_DIR, 'tokenizer.pkl')
label_encoder_path = os.path.join(BASE_DIR, 'label_encoder.pkl')

# Safe loading
try:
    loaded_model = load_model(model_path)
    with open(tokenizer_path, 'rb') as f:
        tokenizer = pickle.load(f)
    with open(label_encoder_path, 'rb') as f:
        label_encoder = pickle.load(f)
    print("Model, tokenizer, and label encoder loaded.")
except Exception as e:
    print("Error loading model or tokenizer:", e)
    loaded_model = None
    tokenizer = None
    label_encoder = None

# Classification function
def classify_text(text):
    if not loaded_model or not tokenizer or not label_encoder:
        return "Error: Model or tokenizer not loaded"
    sequence = tokenizer.texts_to_sequences([text])
    padded = pad_sequences(sequence, maxlen=30)
    prediction = loaded_model.predict(padded)
    predicted_label = label_encoder.inverse_transform([np.argmax(prediction)])
    return predicted_label[0]

