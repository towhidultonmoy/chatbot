from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app, resources={
    r"/text": {
        "origins": ["*"],  # Allow all for ngrok testing
        "methods": ["POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

@app.route('/text', methods=['POST'])
def handle_input():
    # Audio handling
    if 'audio' in request.files:
        audio_file = request.files['audio']
        audio_file.save('temp_audio.webm')  # Save temporarily
        return jsonify({
            "response": f"Received audio recording ({audio_file.filename})"
        })

    # Image handling
    if 'image' in request.files:
        image_file = request.files['image']
        return jsonify({
            "response": f"Received image ({image_file.filename})"
        })

    # Text handling
    if request.json:
        text = request.json.get('text', '')
        return jsonify({
            "response": f"Received text: {text}"
        })

    return jsonify({"response": "No valid input detected"}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
