# from flask import Flask, request, jsonify
# from flask_cors import CORS

# app = Flask(__name__)
# CORS(app, resources={r"/text": {"origins": ["https://*.ngrok.io", "http://localhost:5173", "http://3.134.101.21:5173"]}})  # Replace <EC2_PUBLIC_IP>

# def get_response(text):
#     return f"Received: {text}"

# @app.route('/text', methods=['POST'])
# def text_input():
#     data = request.form if 'image' in request.files or 'audio' in request.files else request.json
#     if not data:
#         return jsonify({"response": "No input provided"}), 400
#     text = data.get('text', 'No text provided')
#     response = get_response(text)
#     return jsonify({"response": response})

# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=5000, debug=False)


from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/text": {"origins": ["https://*.ngrok.io", "http://localhost:5173", "http://3.134.101.21:5173"]}})

def get_response(text):
    return f"Received: {text}"

@app.route('/text', methods=['POST'])
def text_input():
    if request.files:
        text = request.form.get('text', '')
        file_keys = ', '.join(request.files.keys())
        response = get_response(f"{text} (received file: {file_keys})")
        return jsonify({"response": response})
    elif request.is_json:
        data = request.get_json()
        text = data.get('text', '')
        response = get_response(text)
        return jsonify({"response": response})
    else:
        return jsonify({"response": "No valid input provided"}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)

