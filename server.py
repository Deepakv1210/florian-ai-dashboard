
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
CORS(app)

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
def generate_data_fallback(text):
    """Fallback function when API authentication fails"""
    print("Using fallback data generation due to auth issues")
    
    # Basic text analysis to determine possible emergency details
    text_lower = text.lower()
    
    # Simple heuristics for demonstration purposes
    possible_death = 0
    if any(word in text_lower for word in ["dying", "death", "kill", "blood", "bleeding", "gun", "shot", "weapon"]):
        possible_death = 80
    
    false_alarm = 50
    if any(word in text_lower for word in ["joke", "kidding", "prank", "false"]):
        false_alarm = 90
    
    # Extract location - look for addresses or location mentions
    location = "Unknown location"
    
    # Simple description based on content
    description = "Emergency call about "
    if "gun" in text_lower or "shot" in text_lower or "weapon" in text_lower:
        description += "a possible violent situation involving weapons."
        possible_death = 90
        false_alarm = 20
    elif "fire" in text_lower:
        description += "a possible fire emergency."
        possible_death = 70
        false_alarm = 30
    elif "hurt" in text_lower or "injured" in text_lower or "pain" in text_lower:
        description += "someone who may be injured or in pain."
        possible_death = 50
        false_alarm = 40
    elif "sick" in text_lower or "ill" in text_lower:
        description += "someone who may be sick or ill."
        possible_death = 40
        false_alarm = 50
    else:
        description += "an unspecified emergency situation."
    
    # Return structured data
    return {
        "response": {
            "possible_death": possible_death,
            "false_alarm": false_alarm,
            "location": location,
            "description": description
        }
    }

def generate_data(combined_list):
    """Generate data using Google API with API key"""
    try:
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
            return generate_data_fallback(combined_list)
            
    except Exception as e:
        print(f"Error using Google API: {e}")
        # Use fallback if API call fails
        return generate_data_fallback(combined_list)

def run_llm(data):
    print("🚀 Starting LLM with data in background")
    try:
        # Filter to user/assistant messages
        message_data = [item for item in data if item.get('type') in ('user_message', 'assistant_message')]
        print("🚀 message data:", message_data)

        # Combine all "content" strings
        content_data = [msg["message"]["content"] for msg in message_data]
        combined_string = "\n".join(content_data)
        print("🚀 combined list:\n", combined_string)

        # Use standard generate_data function (with fallback built in)
        llm_output = generate_data(combined_string)

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
    except Exception as e:
        print(f"Error in run_llm: {str(e)}")
        # Create a fallback alert
        fallback_alert = {
            "id": generate_id(),
            "title": "Emergency Analysis Failed",
            "message": "There was an error analyzing the emergency call. Please review manually.",
            "severity": "high",  # Assume high severity for safety when analysis fails
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "recipient": {
                "id": f"recipient-{int(time.time() * 1000)}",
                "name": "Emergency Response Team",
                "isOnline": True
            },
            "isRead": False,
            "possible_death": 50,  # Default to medium risk
            "false_alarm": 50,
            "location": "Unknown",
            "description": "Error processing emergency call. Please review manually."
        }
        
        # Add to our store
        alerts.insert(0, fallback_alert)
        print(f"Created fallback alert due to error")
        return fallback_alert


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

@app.route("/messages", methods=["POST"])
def messages():
    data = request.json
    print("📥 Received messageLog from frontend:", data)

    # Create a sample message for testing when we receive an empty message log
    if not data or len(data) == 0:
        print("Empty message log received, using sample data")
        data = [{
            "type": "user_message",
            "message": {
                "content": "Help, there's someone with a gun at 123 Main Street!"
            }
        }]

    # Spawn a new thread to handle data in the background
    thread = threading.Thread(target=run_llm, args=(data,))
    thread.start()

    return jsonify({"status": "ok", "message_count": len(data)})

# Add a test endpoint to generate sample alerts
@app.route("/api/test-alert", methods=["POST"])
def create_test_alert():
    # Create a simple test alert
    test_alert = {
        "id": generate_id(),
        "title": "Test Emergency Alert",
        "message": "This is a test alert for demonstration purposes",
        "severity": "medium",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "recipient": {
            "id": f"recipient-{int(time.time() * 1000)}",
            "name": "Emergency Response Team",
            "isOnline": True
        },
        "isRead": False,
        "possible_death": 30,
        "false_alarm": 70,
        "location": "Test Location",
        "description": "This is a test alert generated for testing purposes. No real emergency."
    }
    
    # Add to our store
    alerts.insert(0, test_alert)
    
    return jsonify({
        "success": True,
        "message": "Test alert created successfully",
        "alert": test_alert
    }), 201

if __name__ == '__main__':
    print("Python API server running at http://localhost:5000")
    
    # Create some initial sample alerts for testing
    if not alerts:
        # Add a few sample alerts if the list is empty
        sample_alerts = [
            {
                "id": f"alert-sample-1",
                "title": "Possible armed robbery",
                "message": "Report of armed individuals at First National Bank",
                "severity": "high",
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "recipient": {
                    "id": "recipient-sample-1",
                    "name": "Emergency Response Team",
                    "isOnline": True
                },
                "isRead": False,
                "possible_death": 85,
                "false_alarm": 20,
                "location": "Downtown Financial District",
                "description": "Report of armed individuals at First National Bank. Multiple witnesses report seeing weapons."
            },
            {
                "id": f"alert-sample-2",
                "title": "Medical emergency at Park Avenue",
                "message": "Elderly person reported difficulty breathing",
                "severity": "medium",
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "recipient": {
                    "id": "recipient-sample-2",
                    "name": "Medical Response Team",
                    "isOnline": True
                },
                "isRead": False,
                "possible_death": 40,
                "false_alarm": 30,
                "location": "Park Avenue Apartments",
                "description": "Elderly person reported difficulty breathing. Caller indicates the person is conscious but struggling."
            }
        ]
        
        # Add sample alerts to the list
        alerts.extend(sample_alerts)
        print(f"Added {len(sample_alerts)} sample alerts for testing")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
