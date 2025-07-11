import numpy as np
from lime.lime_text import LimeTextExplainer
from .classifier import tokenizer, label_encoder, loaded_model
from keras.preprocessing.sequence import pad_sequences
from .classifier import loaded_model as model, tokenizer, label_encoder

# Define category names for LIME to use
class_names = label_encoder.classes_.tolist()

def predict_proba(texts):
    sequences = tokenizer.texts_to_sequences(texts)
    padded = pad_sequences(sequences, maxlen=100)
    preds = model.predict(padded)
    return preds

def explain_with_lime(text):
    pred_fn = lambda x: model.predict(x).astype(float)
    explainer = LimeTextExplainer(class_names=class_names)
    explanation = explainer.explain_instance(
        text_instance=text,
        classifier_fn=predict_proba,
        num_features=6
    )
    return explanation.as_list(), explanation.as_map()
