from flask import Flask, request, jsonify
import json

app = Flask(__name__)

# Mock response function (replace with your actual AI logic)
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
    app.run(host='0.0.0.0', port=5000, debug=False)  # Use 0.0.0.0 for external access, disable debug in production
