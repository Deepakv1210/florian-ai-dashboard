from flask import Flask, request, jsonify
from flask_cors import CORS
import threading
import json
import os
import time

# Try to import Google's genai library, install if not present
try:
    from google import genai
    from google.genai import types
except ImportError:
    import subprocess
    print("Installing google-genai package...")
    subprocess.check_call(["pip", "install", "-q", "-U", "google-genai"])
    from google import genai
    from google.genai import types

app = Flask(__name__)
# Allow CORS from any origin to make it work in cloud environments
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Store alerts in memory for this demo
alerts = []

# Helper function to generate a unique ID
def generate_id():
    return f"alert-{int(time.time() * 1000)}"

# Calculate severity based on alert data
def calculate_severity(data):
    if data.get("possible_death", 0) > 0:
        return "high"
    elif data.get("false_alarm", 100) < 30:
        return "medium"
    else:
        return "low"

######################################
# LLM Logic 
######################################
def generate_data(data, combined_list):
    # Use Google's Generative AI with the provided API key
    client = genai.Client(api_key="AIzaSyCQaeRRWg7UTTRUbSRfwYZ6UP_W5klge7w")

    si_text1 = """You are an expert emergency call analysis assistant. Your task is to analyze 911 call transcripts and extract critical information from the conversation. Focus on identifying potential life-threatening situations, possible false alarms, and any location details shared by the caller. Summarize the incident concisely.

    ⚠️ Important Safety Considerations:

    It is acceptable if a potential false alarm is treated as a real incident. However, it is not acceptable to classify a genuine emergency as a false alarm.

    Similarly, it is acceptable if a potential death is flagged but later turns out not to be fatal. However, never classify a potential fatal situation as \"no death risk\" unless it is explicitly clear."""

    msg1_text1 = types.Part.from_text(text=combined_list)
    model = "gemini-2.0-flash-001"
    contents = [
        types.Content(
            role="user",
            parts=[msg1_text1]
        ),
    ]

    generate_content_config = types.GenerateContentConfig(
        temperature=1,
        top_p=0.95,
        max_output_tokens=8192,
        response_modalities=["TEXT"],
        safety_settings=[
            types.SafetySetting(category="HARM_CATEGORY_HATE_SPEECH", threshold="OFF"),
            types.SafetySetting(category="HARM_CATEGORY_DANGEROUS_CONTENT", threshold="OFF"),
            types.SafetySetting(category="HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold="OFF"),
            types.SafetySetting(category="HARM_CATEGORY_HARASSMENT", threshold="OFF"),
        ],
        response_mime_type="application/json",
        response_schema={
            "type": "OBJECT",
            "properties": {
                "response": {
                    "type": "OBJECT",
                    "required": ["possible_death","false_alarm","location","description"],
                    "properties": {
                        "possible_death": {"type":"NUMBER"},
                        "false_alarm": {"type":"NUMBER"},
                        "location": {"type":"STRING"},
                        "description": {"type":"STRING"}
                    }
                }
            }
        },
        system_instruction=[types.Part.from_text(text=si_text1)],
    )

    llm_output = ""
    for chunk in client.models.generate_content_stream(
        model=model,
        contents=contents,
        config=generate_content_config,
    ):
        llm_output += chunk.text

    try:
        # Parse the JSON output
        result = json.loads(llm_output)
        print("Successfully parsed LLM output as JSON:", result)
        return result
    except json.JSONDecodeError as e:
        print(f"Error parsing LLM output as JSON: {e}")
        print(f"Raw output: {llm_output}")
        # Return a default structure in case of parsing error
        return {
            "response": {
                "possible_death": 0,
                "false_alarm": 90,
                "location": "Unknown",
                "description": "Error processing emergency call. Please review manually."
            }
        }

def run_llm(data):
    print("🚀 Starting LLM with data in background")
    # Filter to user/assistant messages
    message_data = [item for item in data if item.get('type') in ('user_message', 'assistant_message')]
    print("🚀 message data:", message_data)

    # Combine all "content" strings
    content_data = [msg["message"]["content"] for msg in message_data]
    combined_string = "\n".join(content_data)
    print("🚀 combined list:\n", combined_string)

    llm_output = generate_data(data, combined_string)
    print("🚀 LLM output:\n", llm_output)
    
    # Create and add a new alert from the LLM output
    try:
        # Extract response data
        response_data = llm_output.get("response", {})
        
        # Create a new alert
        new_alert = {
            "id": generate_id(),
            "title": response_data.get("description", "New Alert").split('.')[0] if response_data.get("description") else "New Alert",
            "message": response_data.get("description", "New alert received"),
            "severity": calculate_severity(response_data),
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "recipient": {
                "id": f"recipient-{int(time.time() * 1000)}",
                "name": "Emergency Response Team",
                "isOnline": True
            },
            "isRead": False,
            "possible_death": response_data.get("possible_death", 0),
            "false_alarm": response_data.get("false_alarm", 50),
            "location": response_data.get("location", "Unknown"),
            "description": response_data.get("description", "No description provided")
        }
        
        # Add to our store (at beginning of list)
        alerts.insert(0, new_alert)
        print(f"Created new alert: {new_alert['title']}")
        
        return new_alert
    except Exception as e:
        print(f"Error creating alert from LLM output: {str(e)}")
        return None


######################################
# Flask Routes
######################################

@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    return jsonify(alerts)

@app.route('/api/alerts', methods=['POST'])
def add_alert():
    try:
        # Get data from request
        data = request.json.get('response', None)
        if data is None:
            data = request.json
        
        # Calculate severity
        severity = calculate_severity(data)
        
        # Create new alert object
        new_alert = {
            "id": generate_id(),
            "title": data.get("description", "New Alert").split('.')[0] if data.get("description") else "New Alert",
            "message": data.get("description", "New alert received"),
            "severity": severity,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "recipient": {
                "id": f"recipient-{int(time.time() * 1000)}",
                "name": "Emergency Response Team",
                "isOnline": True
            },
            "isRead": False,
            "possible_death": data.get("possible_death"),
            "false_alarm": data.get("false_alarm"),
            "location": data.get("location"),
            "description": data.get("description")
        }
        
        # Add to our store (at beginning of list)
        alerts.insert(0, new_alert)
        
        return jsonify({
            "success": True,
            "message": "Alert created successfully",
            "alert": new_alert
        }), 201
    
    except Exception as e:
        print(f"Error creating alert: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Failed to create alert: {str(e)}"
        }), 500

@app.route('/api/alerts/<alert_id>', methods=['DELETE'])
def delete_alert(alert_id):
    global alerts
    initial_length = len(alerts)
    alerts = [alert for alert in alerts if alert["id"] != alert_id]
    
    if len(alerts) < initial_length:
        return jsonify({
            "success": True,
            "message": "Alert deleted successfully"
        })
    else:
        return jsonify({
            "success": False,
            "message": "Alert not found"
        }), 404

@app.route("/api/messages", methods=["POST"])
def messages():
    data = request.json
    print("📥 Received messageLog from frontend:", data)

    # Spawn a new thread to handle data in the background
    thread = threading.Thread(target=run_llm, args=(data,))
    thread.start()

    return jsonify({"status": "ok", "message_count": len(data)})

if __name__ == '__main__':
    print("Python API server running at http://localhost:5000")
    # Listen on all interfaces so the server is accessible from outside
    app.run(host='0.0.0.0', port=5000, debug=True)
