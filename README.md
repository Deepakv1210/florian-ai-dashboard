# 🚨 Florian AI - Alert Dashboard

A real-time emergency alert dashboard for **Florian AI**, powered by a fine-tuned **Gemini 2.0 LLM**. An intelligent voice assistant designed to support **Texas A&M University (TAMU) Emergency Medical Services (EMS)**.

Florian AI helps EMS responders by analyzing emergency calls when they’re occupied, extracting critical information, and displaying it clearly and urgently to aid prioritization.

## 💡 Why Florian?

Named after **Saint Florian**, the patron saint of first responders, this system is built to **honor the bravery of emergency workers** and provide them with AI-enhanced tools to save lives more efficiently.

---

## 🧠 What It Does

- Accepts alert data from the [Florian Web App](https://github.com/Deepakv1210/FlorianAI)
- Uses a fine-tuned Gemini 2.0 model to:
  - Predict number of casualties
  - Estimate false alarm rate
  - Rank alerts based on severity
- Displays alerts on an interactive dashboard for EMS personnel

---

## 📸 Demo

### 🖥️ Full Application Overview

[![Watch the demo](https://img.youtube.com/vi/damIPy4Vvt8/hqdefault.jpg)](https://youtu.be/damIPy4Vvt8)

### 🎥 Dashboard Functionalities Demo  
[![Functionalities Demo](https://img.youtube.com/vi/m3Y4LSjvcHg/0.jpg)](https://youtu.be/m3Y4LSjvcHg)

---

## Running the Application

### 1. Start the Python server

```
python server.py
```

The server will run on http://localhost:5000.

### 2. Start the React App

In a separate terminal, run:

```
npm run dev
```

The application will run on http://localhost:8080.

## 📡 System Flow

1. Emergency caller interacts with the **Florian AI Web App**
2. Extracted alert is sent to the **Alert Server**
3. Alert is analyzed using fine-tuned Gemini 2.0 LLM
4. Dashboard displays:
   - Description
   - Estimated casualties
   - False alarm probability
   - Location and severity
