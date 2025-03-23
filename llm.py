# from google import genai
# from google.genai import types
# import base64
# import os
# import json

# def generate_data(combined_list):
#   client = genai.Client(
#       api_key="AIzaSyCQaeRRWg7UTTRUbSRfwYZ6UP_W5klge7w"
#   )

# #   msg1_text1 = types.Part.from_text(text="""Monday, 2-20-2006 at 5-59 p.m. Emergency 911, where's the Pavel? My mom had
# # Pavel. You're over there on Spruce. Huh? You're on Spruce.
# # My mom. Where's Mr. Turner at? Right here. Let me speak to him. Let me speak to
# # him. She's not going to talk. Okay, well I'm going to send the police to your
# # house and find out what's going on with you.
# # 1-9-5-0 Spruce. Apartment 3.""")
#   msg1_text1 = types.Part.from_text(text=combined_list)
#   si_text1 = """You are an expert emergency call analysis assistant. Your task is to analyze 911 call transcripts and extract critical information from the conversation. Focus on identifying potential life-threatening situations, possible false alarms, and any location details shared by the caller. Summarize the incident concisely.

# ⚠️ Important Safety Considerations:

# It is acceptable if a potential false alarm is treated as a real incident. However, it is not acceptable to classify a genuine emergency as a false alarm.

# Similarly, it is acceptable if a potential death is flagged but later turns out not to be fatal. However, never classify a potential fatal situation as \"no death risk\" unless it is explicitly clear."""

#   model = "gemini-2.0-flash-001"
#   contents = [
#     types.Content(
#       role="user",
#       parts=[
#         msg1_text1
#       ]
#     ),
#   ]
#   generate_content_config = types.GenerateContentConfig(
#     temperature = 1,
#     top_p = 0.95,
#     max_output_tokens = 8192,
#     response_modalities = ["TEXT"],
#     safety_settings = [types.SafetySetting(
#       category="HARM_CATEGORY_HATE_SPEECH",
#       threshold="OFF"
#     ),types.SafetySetting(
#       category="HARM_CATEGORY_DANGEROUS_CONTENT",
#       threshold="OFF"
#     ),types.SafetySetting(
#       category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
#       threshold="OFF"
#     ),types.SafetySetting(
#       category="HARM_CATEGORY_HARASSMENT",
#       threshold="OFF"
#     )],
#     response_mime_type = "application/json",
#     response_schema = {"type":"OBJECT","properties":{"response":{"type":"OBJECT","required": ["possible_death", "false_alarm", "location", "description"],"properties":{"possible_death":{"type":"NUMBER"},"false_alarm":{"type":"NUMBER"},"location":{"type":"STRING"},"description":{"type":"STRING"}}}}},
#     system_instruction=[types.Part.from_text(text=si_text1)],
#   )

#   # print(data)
#   llm_output = ""
#   for chunk in client.models.generate_content_stream(
#     model = model,
#     contents = contents,
#     config = generate_content_config,
#     ):
#     llm_output += chunk.text
#   print(llm_output)
#   return llm_output
  

# # generate("data")
# def generate_data_custom(combined_list):
#   client = genai.Client(
#       vertexai=True,
#       project="528054701331",
#       location="us-central1",
#   )

#   msg1_text1 = types.Part.from_text(text=combined_list)
#   si_text1 = """You are an expert emergency call analysis assistant. Your task is to analyze 911 call transcripts and extract critical information from the conversation. Focus on identifying potential life-threatening situations, possible false alarms, and any location details shared by the caller. Summarize the incident concisely. Give response to the location in two to three words. 

# ⚠️Important Safety Considerations:

# It is acceptable if a potential false alarm is treated as a real incident. However, it is not acceptable to classify a genuine emergency as a false alarm.

# Similarly, it is acceptable if a potential death is flagged but later turns out not to be fatal. However, never classify a potential fatal situation as \"no death risk\" unless it is explicitly clear."""

#   model = "projects/528054701331/locations/us-central1/endpoints/2458724603497807872"
#   contents = [
#     types.Content(
#       role="user",
#       parts=[
#         msg1_text1
#       ]
#     ),
#   ]
#   generate_content_config = types.GenerateContentConfig(
#     temperature = 1,
#     top_p = 0.95,
#     max_output_tokens = 8192,
#     response_modalities = ["TEXT"],
#     safety_settings = [types.SafetySetting(
#       category="HARM_CATEGORY_HATE_SPEECH",
#       threshold="OFF"
#     ),types.SafetySetting(
#       category="HARM_CATEGORY_DANGEROUS_CONTENT",
#       threshold="OFF"
#     ),types.SafetySetting(
#       category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
#       threshold="OFF"
#     ),types.SafetySetting(
#       category="HARM_CATEGORY_HARASSMENT",
#       threshold="OFF"
#     )],
#     response_mime_type = "application/json",
#     response_schema = {"type":"OBJECT","properties":{"response":{"type":"OBJECT","required":["possible_death","false_alarm","location","description"],"properties":{"possible_death":{"type":"NUMBER"},"false_alarm":{"type":"NUMBER"},"location":{"type":"STRING"},"description":{"type":"STRING"}}}}},
#     system_instruction=[types.Part.from_text(text=si_text1)],
#   )

#   llm_output = ""
#   for chunk in client.models.generate_content_stream(
#     model = model,
#     contents = contents,
#     config = generate_content_config,
#     ):
#         llm_output += chunk.text
#   try:
#     # Parse the JSON output
#     result = json.loads(llm_output)
#     print("Successfully parsed LLM output as JSON:", result)
#     return result
#   except json.JSONDecodeError as e:
#     print(f"Error parsing LLM output as JSON: {e}")
#     print(f"Raw output: {llm_output}")
#     # Return a default structure in case of parsing error
#     return {
#         "response": {
#             "possible_death": 0,
#             "false_alarm": 90,
#             "location": "Unknown",
#             "description": "Error processing emergency call. Please review manually."
#         }
#     }

# combined_list = "Wednesday, 5-9-2007, at 1-43-AM. 9-1-1, state your emergency. Hold on a moment, a moment to hold on. Momentum, sir, because you're already in the hospital. Hold on a moment. 9-1-1, state your emergency. 9-1-1, state your emergency. What's his emergency, sir? Momentum, hold on. I'm trying to get an interpreter for you, sir. Momentum. Yes, can you find out what his emergency is, please? In the emergency room, my wife is dying and the nurses don't want to help her out. Okay, what do you mean she's dying? What's wrong with her? She's vomiting blood. Okay, and why aren't they helping her? Okay, they're watching her there and they're just not doing anything, they're just watching her. Okay, he needs to contact a nurse or a doctor and let them know she's vomiting blood. Paramedics are not going to pick him up or pick his wife up from a hospital because she's already at one. Okay, sir, the paramedics are not going to help him because you're already in the hospital. What you need to do is talk to a doctor or a nurse. They're not going to let him in. If she's in the emergency room, he's not going to come in if he's causing a problem. He needs to contact the county police officers at the security desk there. Okay, sir, go to the desk where the security officers are and talk to them so they can help you contact a doctor. What's the emergency? There's a lady on the ground in the emergency room and they are overlooking her claim that she's been discharged and she's deathly sick and everybody's ignoring her. What would you want me to do for you, ma'am? Send an ambulance out here to take her somewhere where she can get medical help. Okay, you're at the hospital, ma'am, you have to contact them. They have bad metabolism. They won't help her. Well, you know, they're the medical professionals, okay? You're already at a hospital. But you can still send an ambulance. That's my request. I'm sorry? I said you can still send an ambulance to get her. Well, I'll contact the fire department for you. You can talk to them. I have a feeling they're not going to do it for you, ma'am. You're already at the hospital. I know where I am. I beg your pardon? I know where I am. Okay. Well, you know, if you're not pleased with the result you're getting from them, you know, we can't... Well, ma'am, I cannot do anything for you for the quality of the hospital there. You understand what I'm saying? This line is for emergency purposes only. This 911 is used for emergency purposes only. It's not an emergency. It is not an emergency, ma'am. It is. It is not an emergency. I'd like to see how they're treating her. Okay, well, that's not a criminal thing. You understand what I'm saying? We handle... If you have a problem with the quality of the hospital, okay, you have to contact the hospital supervisors, okay, and let them know. The police have nothing to do with that, ma'am. This line, 911, is used for emergency purposes only. Live, threatening emergencies. It is not. Okay? If you want to call us back at our business line, I'll give you the number. I said, if you've got a pen, I'll give you our business line. Okay. I said, may God strike you too. I can't understand what you're saying, ma'am. I said, may God strike you too for acting the way you do. No, negative, ma'am. You're the one."

# generate_data_custom(combined_list)