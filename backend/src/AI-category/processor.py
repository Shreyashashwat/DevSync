from sentence_transformers import SentenceTransformer, util
import google.generativeai as genai
from config import GEMINI_API_KEY, CATEGORY_THRESHOLD

genai.configure(api_key=GEMINI_API_KEY)
gemini = genai.GenerativeModel('gemini-2.5-flash')
model = SentenceTransformer('all-MiniLM-L6-v2')

CATEGORIES = ["Infrastructure", "Sanitation", "Water", "Electricity"]
cat_embs = {cat: model.encode(cat) for cat in CATEGORIES}

KEYWORD_MAPPING = {
    "water": "Water",
    "leak": "Water", "pipe": "Water", "tap": "Water", "flood": "Water", "no water": "Water", "jal": "Water",
    
    "light": "Electricity", "electricity": "Electricity", "power": "Electricity", "bijli": "Electricity",
    "current": "Electricity", "bulb": "Electricity", "wire": "Electricity", "outage": "Electricity",
    
    "road": "Infrastructure", "pothole": "Infrastructure", "bridge": "Infrastructure",
    "drain": "Infrastructure", "manhole": "Infrastructure", "footpath": "Infrastructure",
    
    "garbage": "Sanitation", "kachra": "Sanitation", "dustbin": "Sanitation", "sewage": "Sanitation",
    "toilet": "Sanitation", "smell": "Sanitation", "waste": "Sanitation"
}

def simple_clean(title: str) -> str:
    text = title.lower()

    for ch in ".,!?:;()[]'\"-":
        text = text.replace(ch, " ")
    words = text.split()

    clean_words = []
    for word in words:
        word = word.strip()
        if len(word) > 2: 
            if word.endswith("ing"): word = word[:-3]
            if word.endswith("ed"):  word = word[:-2]
            if word.endswith("es"):  word = word[:-2]
            if word.endswith("s") and len(word) > 3: word = word[:-1] 
            clean_words.append(word)
    
    return " ".join(clean_words)

def get_category(title: str) -> str:
    text = title.lower()
    
    for keyword, cat in KEYWORD_MAPPING.items():
        if keyword in text:
            return cat
    
    cleaned = simple_clean(title)
    if not cleaned:
        return "Others"
    
    emb = model.encode(cleaned)
    sims = {cat: util.cos_sim(emb, cat_embs[cat])[0][0].item() for cat in CATEGORIES}
    best_cat = max(sims, key=sims.get)
    best_score = sims[best_cat]
    
    return best_cat if best_score >= 0.65 else "Others"
    
def get_priority(description: str) -> str:
    low_keywords = [
        "suggestion", "suggest", "request", "please install", "please put", "please provide",
        "idea", "feedback", "opinion", "would be good", "better if", "kindly consider",
        "want", "wish", "hope", "new park", "new bench", "paint", "beautification",
        "tree", "plant", "garden", "playground", "swing", "slide"
    ]
    
    desc_lower = description.lower()
    
    if any(kw in desc_lower for kw in low_keywords):
        return "low"
    prompt = f"""
    You are a priority classifier for complaints. Classify the priority as 'high', 'medium', or 'low' based on urgency and impact.

    Guidelines:
    - High: Immediate danger to life, health, or property. Keywords: emergency, urgent, critical, danger, fire, leak, injury, explosion, threat, life-threatening, outage (power/water), broken (essential), not working (critical services).
      Examples: "Fire in building, people trapped", "Gas leak smelling strong", "Power outage in hospital", "Flooding causing structural damage".
    
    - Medium: Significant issues affecting daily life but not immediate danger. Keywords: delay, issue, problem, malfunction, billing error, charge dispute, slow service, defect.
      Examples: "Street light not working", "Billing overcharge", "Delayed garbage collection", "Minor water drip".
    
    - Low: Suggestions, minor inconveniences, or non-urgent feedback. Keywords: suggestion, feedback, minor, improvement, query, request, cosmetic.
      Examples: "Suggestion for better park benches", "General inquiry about services", "Minor cosmetic repair needed".

    Analyze the description: '{description}'
    Return ONLY the priority level: 'high', 'medium', or 'low'. No explanations.
    """
    resp = gemini.generate_content(prompt)
    priority = resp.text.strip().lower()

    if priority not in ["high", "medium", "low"]:
        priority = "low"
    return priority