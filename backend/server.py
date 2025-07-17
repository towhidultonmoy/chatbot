from flask import Flask, request, jsonify
from flask_cors import CORS
# from werkzeug.utils import secure_filename   # if you plan to save the file

app = Flask(__name__)
CORS(app, resources={r"/text": {"origins": [
    "https://*.ngrok.io", "http://localhost:5173", "http://3.134.101.21:5173"
]}})

def get_response(text):
    return f"Received: {text}"

@app.route('/text', methods=['POST'])
def text_input():
    # 1) IMAGE
    if 'image' in request.files:
        image = request.files['image']
        # filename = secure_filename(image.filename)
        # image.save(f"./uploads/{filename}")  # if you want to save it
        return jsonify({
            "response": f"Image received: {image.filename}"
        }), 200

    # 2) AUDIO
    if 'audio' in request.files:
        audio = request.files['audio']
        return jsonify({
            "response": f"Audio received: {audio.filename}"
        }), 200

    # 3) TEXT
    data = request.get_json(silent=True) or {}
    text = data.get('text')
    if not text:
        return jsonify({"response": "No text provided"}), 400

    return jsonify({"response": get_response(text)}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
