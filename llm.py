from google import genai
from google.genai import types
import base64
import os

def generate_data(data, combined_list):
  client = genai.Client(
      api_key="AIzaSyCQaeRRWg7UTTRUbSRfwYZ6UP_W5klge7w"
  )

#   msg1_text1 = types.Part.from_text(text="""Monday, 2-20-2006 at 5-59 p.m. Emergency 911, where's the Pavel? My mom had
# Pavel. You're over there on Spruce. Huh? You're on Spruce.
# My mom. Where's Mr. Turner at? Right here. Let me speak to him. Let me speak to
# him. She's not going to talk. Okay, well I'm going to send the police to your
# house and find out what's going on with you.
# 1-9-5-0 Spruce. Apartment 3.""")
  msg1_text1 = types.Part.from_text(text=combined_list)
  si_text1 = """You are an expert emergency call analysis assistant. Your task is to analyze 911 call transcripts and extract critical information from the conversation. Focus on identifying potential life-threatening situations, possible false alarms, and any location details shared by the caller. Summarize the incident concisely.

⚠️ Important Safety Considerations:

It is acceptable if a potential false alarm is treated as a real incident. However, it is not acceptable to classify a genuine emergency as a false alarm.

Similarly, it is acceptable if a potential death is flagged but later turns out not to be fatal. However, never classify a potential fatal situation as \"no death risk\" unless it is explicitly clear."""

  model = "gemini-2.0-flash-001"
  contents = [
    types.Content(
      role="user",
      parts=[
        msg1_text1
      ]
    ),
  ]
  generate_content_config = types.GenerateContentConfig(
    temperature = 1,
    top_p = 0.95,
    max_output_tokens = 8192,
    response_modalities = ["TEXT"],
    safety_settings = [types.SafetySetting(
      category="HARM_CATEGORY_HATE_SPEECH",
      threshold="OFF"
    ),types.SafetySetting(
      category="HARM_CATEGORY_DANGEROUS_CONTENT",
      threshold="OFF"
    ),types.SafetySetting(
      category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
      threshold="OFF"
    ),types.SafetySetting(
      category="HARM_CATEGORY_HARASSMENT",
      threshold="OFF"
    )],
    response_mime_type = "application/json",
    response_schema = {"type":"OBJECT","properties":{"response":{"type":"OBJECT","required": ["possible_death", "false_alarm", "location", "description"],"properties":{"possible_death":{"type":"NUMBER"},"false_alarm":{"type":"NUMBER"},"location":{"type":"STRING"},"description":{"type":"STRING"}}}}},
    system_instruction=[types.Part.from_text(text=si_text1)],
  )

  # print(data)
  llm_output = ""
  for chunk in client.models.generate_content_stream(
    model = model,
    contents = contents,
    config = generate_content_config,
    ):
    llm_output += chunk.text
  # print(llm_output)
  return llm_output
  

# generate("data")