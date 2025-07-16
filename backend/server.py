from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import base64
import tempfile
import numpy as np
import sounddevice as sd
import scipy.io.wavfile as wav
import whisper
import warnings
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
from elevenlabs import play
from agents import Agent, Runner, function_tool
from dataclasses import dataclass, field
from typing import List
import openai
import asyncio
app = Flask(__name__)
CORS(app, resources={r"/text": {"origins": "*"}})

# Configure upload folder
app.config['UPLOAD_FOLDER'] = './uploads'
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# Load environment variables
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")
elevenlabs_api_key = os.getenv("ELEVENLABS_API_KEY")

# Initialize Whisper model with error handling
warnings.filterwarnings("ignore", category=UserWarning)
WHISPER_MODEL = None
try:
    print("Loading Whisper model...")
    WHISPER_MODEL = whisper.load_model("base")
    print("Model loaded.")
except Exception as e:
    print(f"Error loading Whisper model: {e}. Audio transcription will be disabled.")
    WHISPER_MODEL = None

# Initialize ElevenLabs
elevenlabs = ElevenLabs(api_key=elevenlabs_api_key) if elevenlabs_api_key else None
play_speech = True if elevenlabs_api_key else False

# Voice profiles
same_model_id = "eleven_multilingual_v2"
VOICE_PROFILES = {
    "Empathetic": {"voice_id": "g6xIsTj2HwM6VR4iXFCw", "model_id": same_model_id},
    "Professional": {"voice_id": "1SM7GgM6IMuvQlz2BwM3", "model_id": same_model_id},
    "Energetic": {"voice_id": "56AoDkrOh6qfVPDXZ7Pt", "model_id": same_model_id},
}

# Dataclass Context
@dataclass
class UserProfile:
    name: str
    age: int
    weight_kg: float
    sleep_hours: float
    hrv_change: float
    sleep_quality: float
    thirthy_days_sleep_quality: float
    hydroxy_vitamin_d: float
    hs_crp: float
    conversation_history: List[str] = field(default_factory=list)

# Function Tool
@function_tool
def fetch_profile_info(ctx: UserProfile) -> str:
    return (
        """
        ### **User Profile of Ryan**

        **1. User Demographics & Vitals**
        * **Name:** Ryan
        * **Date of Birth:** August 6, 1992
        * **Age:** 32
        * **Family:** Married, 2 children (Bobby, age 9; Braxton, age 1)
        * **Height:** 6'1" (185 cm)
        * **Weight:** 185 lbs (83.9 kg)
        * **Body Composition (Withings):**
            * Body Fat: 16.3%
            * Lean Body Mass: 150.5 lbs

        **2. Primary Goals & Lifestyle**
        * **Main Objective:** Anti-aging and longevity.
        * **Dietary Approach:** Low-carbohydrate diet.
        * **Activity Level:** Active lifestyle.
            * **Average Daily Steps (Whoop):** 7,005

        **3. Key Health & Fitness Metrics (Wearables)**
        * **Cardiorespiratory Fitness:**
            * **Resting Heart Rate (RHR):** 40-45 bpm (Oura/Whoop)
            * **Heart Rate Variability (HRV):** 101 ms (Whoop)
            * **Estimated VO₂ Max:** 51 mL/(kg·min) (Whoop)
        * **Sleep (Oura):**
            * **Total Sleep:** 6 hours, 31 minutes
            * **REM Sleep:** 1 hour, 41 minutes
            * **Deep Sleep:** 1 hour, 36 minutes

        **4. Medical Snapshot & Biomarker Analysis**

        * **Overall Status:** Excellent metabolic health and low inflammation. The primary area for optimization is the lipid profile, specifically related to lipoprotein particle quality and fatty acid balance.

        * **Metabolic Health: Optimal**
            * **Glucose:** 89 mg/dL (In Range)
            * **Hemoglobin A1c (HbA1c):** 5.0% (In Range)
            * **Fasting Insulin:** 4.8 uIU/mL (In Range)
            * *Summary: Indicates excellent long-term blood sugar control and insulin sensitivity.*

        * **Inflammation: Very Low**
            * **High-Sensitivity C-Reactive Protein (hs-CRP):** 0.2 mg/L
            * *Summary: Indicates a very low level of systemic inflammation, which is highly favorable for longevity and cardiovascular health.*

        * **Cardiovascular Health (Lipid Profile): Mixed**
            * **Standard Panel (In Range):**
                * Total Cholesterol: 193 mg/dL
                * HDL Cholesterol: 68 mg/dL
                * Triglycerides: 71 mg/dL
                * Non-HDL Cholesterol: 125 mg/dL
                * Lipoprotein (a): <10 nmol/L
            * **Advanced Panel (Areas for Improvement):**
                * **Lipoprotein Quality:** Concerns noted regarding elevated levels of small, dense LDL particles and a lack of large, protective HDL particles.
                * **Apolipoprotein B (ApoB):** Reported as slightly exceeded.
            * *Summary: While standard cholesterol numbers are good, advanced testing suggests a need to improve the quality and size of lipoprotein particles to further reduce cardiovascular risk.*

        * **Nutrient & Fatty Acid Status:**
            * **Vitamin D:** 58 ng/mL (Optimal)
            * **Omega-3 Index:** 4.3% by wt (Slightly below optimal)
            * **Omega-6 (Linoleic Acid):** 31.2% by wt (Moderately elevated)
            * *Summary: Vitamin D level is excellent. The Omega-6 to Omega-3 ratio is imbalanced, suggesting a need to increase Omega-3 intake to support anti-inflammatory pathways.*

        **5. Summary for AI Interaction**

        * **Strengths:** Ryan is a health-conscious 32-year-old with excellent metabolic function, very low inflammation, and strong cardiorespiratory fitness metrics (RHR, HRV, VO₂ Max). His lifestyle choices (low-carb diet, active) are positively impacting these areas.
        * **Areas for Focus:** The primary health opportunities are:
            1.  **Improving Lipid Quality:** Shifting the lipoprotein profile from small, dense LDL particles toward larger, fluffier particles and increasing large HDL.
            2.  **Balancing Fatty Acids:** Increasing the Omega-3 to Omega-6 ratio by incorporating more Omega-3-rich foods.
        * **Context:** User is motivated by anti-aging and longevity. Recommendations should be framed around optimizing an already healthy baseline, focusing on nuanced biomarker improvements.

        **6. Exercise Recommendations by Intensity:**
        * **Moderate Intensity (for Aerobic Base):**
            * Air squats
            * Lunges
            * Push-ups
            * Jumping jacks
            * Butt kickers
            * Jogging in place
        * **Vigorous Intensity (for HIIT):**
            * Shadow boxing
            * Bear crawls
            * High knees
            * Burpees (moderate, no push-up/jump)
            * Mountain climbers
            * Speed skaters
            * Jump rope (simulated)
            * Burpees (moderate, with push-up/jump)
        * **Maximal Intensity (for Peak Effort):**
            * Burpees (fast, with push-up/jump)

        **7. Suggested Workout Structure:**
        * **HIIT Workout:** 2-3 times per week using a circuit of vigorous intensity exercises (e.g., 45 seconds on, 15 seconds off for 15-20 minutes).
        * **Steady-State Cardio:** 2-3 times per week using a continuous circuit of moderate intensity exercises for 30-45 minutes.
        """
    )

# Dynamic Instruction Builder
def build_dynamic_instructions(profile: UserProfile) -> str:
    profile_info = (
        """
        ### **User Profile of Ryan**

        **1. User Demographics & Vitals**
        * **Name:** Ryan
        * **Date of Birth:** August 6, 1992
        * **Age:** 32
        * **Family:** Married, 2 children (Bobby, age 9; Braxton, age 1)
        * **Height:** 6'1" (185 cm)
        * **Weight:** 185 lbs (83.9 kg)
        * **Body Composition (Withings):**
            * Body Fat: 16.3%
            * Lean Body Mass: 150.5 lbs

        **2. Primary Goals & Lifestyle**
        * **Main Objective:** Anti-aging and longevity.
        * **Dietary Approach:** Low-carbohydrate diet.
        * **Activity Level:** Active lifestyle.
            * **Average Daily Steps (Whoop):** 7,005

        **3. Key Health & Fitness Metrics (Wearables)**
        * **Cardiorespiratory Fitness:**
            * **Resting Heart Rate (RHR):** 40-45 bpm (Oura/Whoop)
            * **Heart Rate Variability (HRV):** 101 ms (Whoop)
            * **Estimated VO₂ Max:** 51 mL/(kg·min) (Whoop)
        * **Sleep (Oura):**
            * **Total Sleep:** 6 hours, 31 minutes
            * **REM Sleep:** 1 hour, 41 minutes
            * **Deep Sleep:** 1 hour, 36 minutes

        **4. Medical Snapshot & Biomarker Analysis**

        * **Overall Status:** Excellent metabolic health and low inflammation. The primary area for optimization is the lipid profile, specifically related to lipoprotein particle quality and fatty acid balance.

        * **Metabolic Health: Optimal**
            * **Glucose:** 89 mg/dL (In Range)
            * **Hemoglobin A1c (HbA1c):** 5.0% (In Range)
            * **Fasting Insulin:** 4.8 uIU/mL (In Range)
            * *Summary: Indicates excellent long-term blood sugar control and insulin sensitivity.*

        * **Inflammation: Very Low**
            * **High-Sensitivity C-Reactive Protein (hs-CRP):** 0.2 mg/L
            * *Summary: Indicates a very low level of systemic inflammation, which is highly favorable for longevity and cardiovascular health.*

        * **Cardiovascular Health (Lipid Profile): Mixed**
            * **Standard Panel (In Range):**
                * Total Cholesterol: 193 mg/dL
                * HDL Cholesterol: 68 mg/dL
                * Triglycerides: 71 mg/dL
                * Non-HDL Cholesterol: 125 mg/dL
                * Lipoprotein (a): <10 nmol/L
            * **Advanced Panel (Areas for Improvement):**
                * **Lipoprotein Quality:** Concerns noted regarding elevated levels of small, dense LDL particles and a lack of large, protective HDL particles.
                * **Apolipoprotein B (ApoB):** Reported as slightly exceeded.
            * *Summary: While standard cholesterol numbers are good, advanced testing suggests a need to improve the quality and size of lipoprotein particles to further reduce cardiovascular risk.*

        * **Nutrient & Fatty Acid Status:**
            * **Vitamin D:** 58 ng/mL (Optimal)
            * **Omega-3 Index:** 4.3% by wt (Slightly below optimal)
            * **Omega-6 (Linoleic Acid):** 31.2% by wt (Moderately elevated)
            * *Summary: Vitamin D level is excellent. The Omega-6 to Omega-3 ratio is imbalanced, suggesting a need to increase Omega-3 intake to support anti-inflammatory pathways.*

        * **Strengths:** Ryan is a health-conscious 32-year-old with excellent metabolic function, very low inflammation, and strong cardiorespiratory fitness metrics (RHR, HRV, VO₂ Max). His lifestyle choices (low-carb diet, active) are positively impacting these areas.
        * **Areas for Focus:** The primary health opportunities are:
            1.  **Improving Lipid Quality:** Shifting the lipoprotein profile from small, dense LDL particles toward larger, fluffier particles and increasing large HDL.
            2.  **Balancing Fatty Acids:** Increasing the Omega-3 to Omega-6 ratio by incorporating more Omega-3-rich foods.
        * **Context:** User is motivated by anti-aging and longevity. Recommendations should be framed around optimizing an already healthy baseline, focusing on nuanced biomarker improvements.

        **5. Summary for AI Interaction**

        * **Strengths:** Ryan is a health-conscious 32-year-old with excellent metabolic function, very low inflammation, and strong cardiorespiratory fitness metrics (RHR, HRV, VO₂ Max). His lifestyle choices (low-carb diet, active) are positively impacting these areas.
        * **Areas for Focus:** The primary health opportunities are:
            1.  **Improving Lipid Quality:** Shifting the lipoprotein profile from small, dense LDL particles toward larger, fluffier particles and increasing large HDL.
            2.  **Balancing Fatty Acids:** Increasing the Omega-3 to Omega-6 ratio by incorporating more Omega-3-rich foods.
        * **Context:** User is motivated by anti-aging and longevity. Recommendations should be framed around optimizing an already healthy baseline, focusing on nuanced biomarker improvements.

        **6. Exercise Recommendations by Intensity:**
        * **Moderate Intensity (for Aerobic Base):**
            * Air squats
            * Lunges
            * Push-ups
            * Jumping jacks
            * Butt kickers
            * Jogging in place
        * **Vigorous Intensity (for HIIT):**
            * Shadow boxing
            * Bear crawls
            * High knees
            * Burpees (moderate, no push-up/jump)
            * Mountain climbers
            * Speed skaters
            * Jump rope (simulated)
            * Burpees (moderate, with push-up/jump)
        * **Maximal Intensity (for Peak Effort):**
            * Burpees (fast, with push-up/jump)

        **7. Suggested Workout Structure:**
        * **HIIT Workout:** 2-3 times per week using a circuit of vigorous intensity exercises (e.g., 45 seconds on, 15 seconds off for 15-20 minutes).
        * **Steady-State Cardio:** 2-3 times per week using a continuous circuit of moderate intensity exercises for 30-45 minutes.
        """
    )

    # Few-shot examples
    few_shot_example_1 = (
        "User asks:\n"
        "“Can you give me a balanced workout for today? Maybe something with a mix of intensities.”\n\n"
        "Coach responds:\n"
        "“Absolutely! A balanced workout is a fantastic goal for today, and this plan will help you feel strong and energized. Listen to your body and have a wonderful session. You are going to do great!\n\n"
        "For a moderate intensity workout, you can start a circuit with one minute of air squats, followed by one minute of push-ups, and then two minutes of jogging in place. After you finish, rest for one minute. You can repeat that whole circuit two or three times for a complete workout.\n\n"
        "If you want something more vigorous, try this. Go hard with high knees for thirty seconds, then right into mountain climbers for thirty seconds, and finish the set with thirty seconds of burpees. Take a full minute to rest, and then repeat that circuit two or three more times to really challenge yourself.”\n"
    )

    few_shot_example_2 = (
        """User (Ryan) asks:\n"
        So what exercise should I do today?
        ELIA replies:
        It sounds like you're eager to get started! Let’s structure your workout into a smooth flow, focusing on both moderate and vigorous intensities.

        Start with a warm-up to prepare your body; spend about five to ten minutes doing light stretches and movements like arm circles and leg swings. Then, move into a moderate intensity circuit: begin with air squats for one minute, followed by push-ups for one minute, and finish with two minutes of jogging in place. Rest for one minute, and repeat that circuit two to three times.

        After that, dive into a vigorous intensity circuit: first, do high knees for thirty seconds, then transition into mountain climbers for thirty seconds, and complete the set with thirty seconds of burpees. Take a full minute to rest afterward, and repeat this circuit two to three more times.

        Finally, remember to cool down for about five minutes with gentle stretches to help your muscles recover. You’re going to do great! Enjoy each movement and listen to your body as you go.\n\n"""
    )

    few_shot_example_3 = (
        "User (Ryan) says:\n"
        "“Hey ELIA, I just got my latest reports back. I feel great, but I saw some notes about improving my lipid quality and omega-3s for my longevity goals. What lifestyle changes should I focus on?”\n\n"
        "Coach (ELIA) responds:\n"
        "“Ryan, it is fantastic that you are diving deep into optimizing your health, and your excellent metabolic and fitness markers show how much your hard work is paying off. To help with your goal of improving lipid quality and balancing your fatty acids, a wonderful step is to increase your intake of Omega-3 rich foods. Incorporating fatty fish like salmon or sardines into your meals a few times a week is a powerful way to support your cardiovascular health and longevity goals.”\n"
    )

    history = "\n".join(f"User: {msg}" for msg in profile.conversation_history[-5:])

    prompt = (
        """
        # ROLE AND PERSONA
        You are a health coach, named ELIA. Your personality is warm, loving, and consistently encouraging. Your purpose is to empower clients to build sustainable, healthy lifestyles.

        ---

        # CORE KNOWLEDGE AND PHILOSOPHY
        - **Expertise:** General wellness, nutrition, exercise, and stress management.
        - **Nutritional Stance:** You advocate for a diet focused on low carbohydrates and high protein. You endorse intermittent fasting and high-quality animal-based proteins. Vegetarian/vegan options are secondary and should only be offered upon direct request.
        - **Primary Goal:** Help clients meet or exceed their protein targets while staying at or below their carbohydrate targets.

        ---

        # CRITICAL SAFETY GUARDRAIL
        - **Strictly Prohibit Medical Advice:** Under no circumstances do you diagnose conditions or give medical advice. If a user asks a medical question, you must decline and direct them to a healthcare professional using a phrase like, "It's best to consult your doctor for any medical questions."

        ---
        # RULES OF ENGAGEMENT AND FORMATTING
        - **Response Length:** All responses must be three sentences or less.
            - **Exception:** Workout/Exercise and food recipes are exempt from this rule to ensure clarity.
        - **Response Style:**
            - Use a warm, human-like tone that is easy to listen to.
            - Provide personalized, actionable advice based on the user's data.
            - Use motivational language to keep clients engaged.
        - **Formatting for Voice:**
            - **No Lists or Points:** Do not use any visual formatting like bullet points, numbered lists, hyphens, or asterisks.
            - **Conversational Paragraphs:** For multi-step instructions like workouts or recipes, describe the steps in natural, flowing paragraphs. Use full sentences and connecting phrases (e.g., "Next, you will...", "After that, focus on...") to create a script that is easy for a voice actor to read.
        - **Interaction Flow:** Do not ask follow-up questions unless essential for clarification to provide a safe and accurate answer.
        """
    )

    return (
        profile_info
        + prompt
        + few_shot_example_1
        + few_shot_example_2
        + few_shot_example_3
        + "Recent conversation:\n"
        + history
    )

def record_audio(duration=8, fs=16000):
    print(f"🎤 Recording for {duration} seconds...")
    audio = sd.rec(int(duration * fs), samplerate=fs, channels=1, dtype='float32')
    sd.wait()
    print("✅ Recording complete.")
    return audio, fs

def save_wav(audio, fs, filename):
    audio_int16 = (audio * 32767).astype(np.int16)
    wav.write(filename, fs, audio_int16)

def transcribe_with_whisper(audio_file):
    if WHISPER_MODEL is None:
        return "Audio transcription is unavailable due to model loading error."
    result = WHISPER_MODEL.transcribe(audio_file)
    return result["text"]

def encode_image_to_base64(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")

def detect_foods_json(image_path):
    base64_image = encode_image_to_base64(image_path)
    prompt = (
        """
        ROLE:
        You are a highly advanced, friendly food recognition and nutrition analysis assistant. You use computer vision and nutrition intelligence to evaluate food images with chef-level specificity and coaching-level encouragement.
        WHEN AN IMAGE IS RECEIVED:
        1. Food Detection:
            First, determine if any recognizable food is present.
            If no food is detected, respond:
                "Hey! I didn’t spot any food in this image. Want to try taking another photo or show me what you’re eating today?"

        IF FOOD IS PRESENT:
            2. Food Identification:
                Identify each distinct food item in the image.
                Describe them vividly—like a passionate chef. Mention:
                    Ingredient details (e.g., ribeye steak vs. sirloin)
                    Cooking methods (e.g., grilled, baked, pan-seared)
                    Visible garnishes, toppings, or sides
                    Cultural or dish-specific cues (e.g., biryani vs. plain rice)

            3. Nutritional Estimation (for the total meal):
                Protein (grams)
                Carbohydrates (grams)
                Fiber (grams)
                Calories (kcal)

            4. ELIA Meal Quality Scoring (0–100):
                Protein Score (Max 40)
                    40 × (1.5 ÷ [carbs_grams ÷ protein_grams]), capped at 40
                Carb Quality Score (Max 30)
                    30 × (5 ÷ [carbs_grams ÷ fiber_grams]), capped at 30
                Portion Control Score (Max 30)
                    If ≤600 kcal, score is 30
                    If >600 kcal, score = 30 × (600 ÷ calories), capped at 30
                Total Score = Protein + Carb Quality + Portion Control

            5. Meal Zone Assignment:
                Green (80–100): Optimal meal quality
                Yellow (60–79): Moderate; has room for improvement
                Red (<60): Needs significant improvement

            6. Personalized Suggestions:
                Offer realistic, supportive, and gradual improvements:
                    If calories are high: suggest partial reductions (e.g., “halve the rice portion” vs. “cut to 600”)
                    If low fiber: suggest swapping some carbs for fibrous vegetables and explain why it helps

                For each suggestion, estimate the new improved score if implemented

        FINAL RESPONSE FORMAT:
            Start with a warm greeting (e.g., “Hey there!”)
            Use descriptive, engaging language to describe the foods (chef-style)
            Include a nutrient breakdown and Meal Quality sub-scores
            Share the Meal Zone with encouraging commentary
            Give 1–2 practical improvement tips with new score estimates
            Always be clear, empowering, and progress-focused—not perfectionistic"""
    )

    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                ]
            }
        ],
        max_tokens=500,
    )
    raw_response = response.choices[0].message.content
    cleaned = raw_response.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned.removeprefix("```json").strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.removeprefix("```").strip()
    if cleaned.endswith("```"):
        cleaned = cleaned.removesuffix("```").strip()
    return cleaned

def speak(text: str, profile: str) -> None:
    if play_speech and elevenlabs:
        config = VOICE_PROFILES.get(profile)
        if not config:
            raise ValueError(f"Unknown profile '{profile}'. Choose from: {list(VOICE_PROFILES)}")
        audio_bytes = elevenlabs.text_to_speech.convert(
            text=text,
            voice_id=config["voice_id"],
            model_id=config["model_id"],
        )
        play(audio_bytes)

# Initialize user profile
user_profile = UserProfile(name="Ryan", age=32, weight_kg=75, sleep_hours=6.5, hrv_change=-12.0, sleep_quality=5.0, thirthy_days_sleep_quality=7.0, hydroxy_vitamin_d=22.0, hs_crp=3.2)

@app.route('/')
def home():
    return jsonify({"message": "ELIA Backend is running! Use the frontend at http://localhost:5173 or your ngrok URL to interact."})

@app.route('/text', methods=['POST'])
def handle_text():
    print("Received request:", request.headers)
    print("Request files:", request.files)
    if request.content_type.startswith('multipart/form-data'):
        text = None
        if 'image' in request.files:
            file = request.files['image']
            if file and file.filename:
                filename = secure_filename(file.filename)
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(file_path)
                text = detect_foods_json(file_path)
                os.remove(file_path)  # Clean up after processing
        elif 'audio' in request.files:
            file = request.files['audio']
            if file and file.filename:
                filename = secure_filename(file.filename)
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(file_path)
                text = transcribe_with_whisper(file_path)
                os.remove(file_path)  # Clean up after processing
            else:
                return jsonify({"error": "No valid audio file provided"}), 400
        else:
            text = request.form.get('text')
            if not text:
                return jsonify({"error": "No text or file provided"}), 400
    else:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        text = data.get('text')
        if not text:
            return jsonify({"error": "No text provided"}), 400

    user_profile.conversation_history.append(text)
    # Configure Agent with OpenAI Agents SDK
    nutrition_agent = Agent(
        name="ELIA",
        instructions=build_dynamic_instructions(user_profile),
        tools=[fetch_profile_info],
        model="gpt-4o-mini"
    )

    # Ensure an event loop is available
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        result = loop.run_until_complete(Runner.run(nutrition_agent, text, context=user_profile))
        response_text = result.final_output
    finally:
        loop.close()

    speak(response_text, profile="Empathetic")
    return jsonify({"response": response_text})

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)