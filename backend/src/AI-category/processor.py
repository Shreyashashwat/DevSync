from sentence_transformers import SentenceTransformer, util
import google.generativeai as genai
from config import GEMINI_API_KEY, CATEGORY_THRESHOLD

genai.configure(api_key=GEMINI_API_KEY)
gemini = genai.GenerativeModel('gemini-2.5-flash')
model = SentenceTransformer('all-MiniLM-L6-v2')

