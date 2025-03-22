
import express from 'express';
import cors from 'cors';
import { addAlert, getAlerts, deleteAlert } from '../services/alertApi';

// Create Express app
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/alerts', (req, res) => {
  res.json(getAlerts());
});

app.post('/api/alerts', (req, res) => {
  try {
    // Extract response data from the request body
    const alertData = req.body.response || req.body;
    
    // Add the alert
    const newAlert = addAlert(alertData);
    
    // Return success response
    res.status(201).json({ 
      success: true, 
      message: 'Alert created successfully', 
      alert: newAlert 
    });
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create alert' 
    });
  }
});

app.delete('/api/alerts/:id', (req, res) => {
  const deleted = deleteAlert(req.params.id);
  if (deleted) {
    res.json({ success: true, message: 'Alert deleted successfully' });
  } else {
    res.status(404).json({ success: false, message: 'Alert not found' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});

// Export for potential use in development
export default app;
