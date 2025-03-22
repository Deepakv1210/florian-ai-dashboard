
# Alert Dashboard

A dashboard for monitoring and responding to emergency alerts.

## Running the Application

### 1. Start the Python API Server

First, install the required Python packages:

```
pip install flask flask-cors
```

Then start the Python server:

```
python server.py
```

The server will run on http://localhost:5000. You should see the following output:
```
Python API server running at http://localhost:5000
 * Serving Flask app 'server'
 * Debug mode: on
```

### 2. Start the React App

In a separate terminal, run:

```
npm start
```

The application will run on http://localhost:3000.

## Troubleshooting

### CORS Issues

If you see errors like `ERR_BLOCKED_BY_CLIENT` in your browser console:

1. Check if you have any ad blockers or browser extensions that might be blocking requests to localhost
2. If using Chrome, you can try launching it with web security disabled:
   ```
   chrome.exe --disable-web-security --user-data-dir=C:\temp
   ```
3. Make sure your Python server is running and accessible

### Demo Mode

The dashboard includes a demo mode that will activate automatically if it cannot connect to the Python server. In demo mode, you'll see a yellow notification banner and sample alerts will be displayed.

## Using Postman to Send Alerts

1. Open Postman
2. Create a new POST request to `http://localhost:5000/api/alerts`
3. Set the request body to JSON format with content similar to:

```json
{
  "description": "Building fire reported in downtown area. Multiple people trapped inside.",
  "possible_death": 3,
  "false_alarm": 10,
  "location": "123 Main St, Downtown"
}
```

4. Send the request
5. The alert will appear in the dashboard

## Alert Properties

- `description`: Text description of the alert
- `possible_death`: Number of potential casualties (affects severity)
- `false_alarm`: Percentage chance this is a false alarm (0-100, affects severity)
- `location`: Physical location of the incident
