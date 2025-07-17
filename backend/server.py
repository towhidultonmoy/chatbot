from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app, resources={r"/text": {"origins": ["https://*.ngrok.io", "http://localhost:5173", "http://3.134.101.21:5173"]}})

def get_response(text):
    return f"Received: {text}"

@app.route('/text', methods=['POST'])
def text_input():
    # Handle file uploads
    if 'image' in request.files:
        image_file = request.files['image']
        # You can save the file or process it here
        # For now, we'll just acknowledge receipt
        return jsonify({"response": f"Received image: {image_file.filename}"})
    
    # Handle audio uploads
    if 'audio' in request.files:
        audio_file = request.files['audio']
        # Process audio file here
        return jsonify({"response": f"Received audio: {audio_file.filename}"})
    
    # Handle regular text input
    data = request.get_json()
    if not data:
        return jsonify({"response": "No input provided"}), 400
    
    text = data.get('text', 'No text provided')
    response = get_response(text)
    return jsonify({"response": response})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
