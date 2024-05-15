import os
from flask import Flask, render_template, request, jsonify
import cv2
import numpy as np
import pytesseract
import fitz  
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)

# def ocr_text(image_path):
#     image = cv2.imread(image_path)
#     gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
#     text = pytesseract.image_to_string(gray_image)
#     return text

def ocr_pdf(filepath):
    try:
        text = ""
        with fitz.open(filepath) as doc:
            for page in doc:
                text += page.get_text()
        return text
    except Exception as e:
        return text


def preprocess_text(text):
    text = text.lower()
    text = ''.join(e for e in text if e.isalnum() or e.isspace())
    return text

def calculate_similarity(text1, text2):
    vectorizer = CountVectorizer().fit_transform([text1, text2])
    vectors = vectorizer.toarray()
    cosine_sim = cosine_similarity(vectors)
    return cosine_sim[0][1]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({'error': 'Tidak ada file'})

    files = request.files.getlist('file')
    similarity_results = []

    try:
        if not os.path.exists('temp'):
            os.makedirs('temp')

        for file in files:
            if file.filename == '':
                return jsonify({'error': 'No selected file'})

            file_path = 'temp/' + file.filename
            file.save(file_path)

            text = ocr_pdf(file_path)
            preprocessed_text = preprocess_text(text)

            similarity_results.append({'filename': file.filename, 'text': preprocessed_text})
            os.remove(file_path)

        similarity_pairs = []
        for i in range(len(similarity_results)):
            for j in range(i + 1, len(similarity_results)):
                similarity = calculate_similarity(similarity_results[i]['text'], similarity_results[j]['text'])
                similarity_pairs.append({'file1': similarity_results[i]['filename'], 'file2': similarity_results[j]['filename'], 'similarity': similarity})

        return jsonify({'similarity_results': similarity_pairs})
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == "__main__":
    app.run(debug=True)
