from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/text": {"origins": ["https://*.ngrok.io", "http://localhost:5173", "http://3.134.101.21:5173"]}})  # Replace <EC2_PUBLIC_IP>

def get_response(text):
    return f"Received: {text}"

@app.route('/text', methods=['POST'])
def text_input():
    data = request.form if 'image' in request.files or 'audio' in request.files else request.json
    if not data:
        return jsonify({"response": "No input provided"}), 400
    text = data.get('text', 'No text provided')
    response = get_response(text)
    return jsonify({"response": response})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
