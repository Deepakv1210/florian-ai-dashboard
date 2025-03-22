
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import time

app = Flask(__name__)
# Configure CORS with more explicit settings to allow all origins
CORS(app, resources={r"/api/*": {"origins": "*", "methods": ["GET", "POST", "DELETE", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization"]}})

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

@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    # Add response headers to ensure proper CORS
    response = jsonify(alerts)
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return response

@app.route('/api/alerts', methods=['POST'])
def add_alert():
    try:
        print("Received POST request to /api/alerts")
        print(f"Request headers: {request.headers}")
        
        # Get data from request
        data = request.json.get('response', None)
        if data is None:
            data = request.json
            
        print(f"Received alert data: {data}")
        
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
        
        print(f"Created new alert: {new_alert}")
        
        response = jsonify({
            "success": True,
            "message": "Alert created successfully",
            "alert": new_alert
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        return response, 201
    
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
        response = jsonify({
            "success": True,
            "message": "Alert deleted successfully"
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        return response
    else:
        response = jsonify({
            "success": False,
            "message": "Alert not found"
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        return response, 404

# Add options method to handle preflight requests
@app.route('/api/alerts', methods=['OPTIONS'])
def options_alerts():
    response = app.make_default_options_response()
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return response

@app.route('/api/alerts/<alert_id>', methods=['OPTIONS'])
def options_alert(alert_id):
    response = app.make_default_options_response()
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return response

# Add a simple health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "timestamp": time.time()})

if __name__ == '__main__':
    print("Python API server running at http://localhost:5000")
    # Make the server accessible from any network interface
    app.run(host='0.0.0.0', port=5000, debug=True)
