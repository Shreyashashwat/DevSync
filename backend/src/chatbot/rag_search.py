from config import model, qdrant, docs, COLLECTION_NAME, GEMINI_API_KEY, GEMINI_MODEL
from bson import ObjectId
from qdrant_client import models
import requests


# -------------------------------
# ✅ QDRANT SEARCH (ROLE AWARE)
# -------------------------------
def search_qdrant(
    query: str,
    tenant_id: str,
    role: str,
    user_id: str | None = None,
    top_k: int = 5
):
    # ✅ Encode query
    query_vec = model.encode(query).tolist()

    # ✅ Base tenant filter
    must_filters = [
        models.FieldCondition(
            key="tenant_id",
            match=models.MatchValue(value=str(tenant_id))
        )
    ]

    # ✅ ROLE-BASED ACCESS
    if role == "staff" and user_id:
        must_filters.append(
            models.FieldCondition(
                key="assigned_to",
                match=models.MatchValue(value=str(user_id))
            )
        )

    elif role == "citizen" and user_id:
        must_filters.append(
            models.FieldCondition(
                key="submitted_by",
                match=models.MatchValue(value=str(user_id))
            )
        )

    query_filter = models.Filter(must=must_filters)

    # ✅ CORRECT QDRANT QUERY (1.16+)
    # ✅ CORRECT QDRANT QUERY (1.16+)
    hits = qdrant.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vec,
        query_filter=query_filter,
        limit=top_k,
        with_payload=True
    )
   
    contexts = []

    for hit in hits.points:
        if not hit.payload or "doc_id" not in hit.payload:
            continue

        doc = docs.find_one({"_id": ObjectId(hit.payload["doc_id"])})
        if not doc:
            continue

        formatted_text = (
            f"Title: {doc.get('title', 'Untitled')}\n"
            f"Category: {doc.get('category', 'General')} | "
            f"Priority: {doc.get('priority', 'Low')} | "
            f"Status: {doc.get('status', 'Open')}\n"
            f"Description: {doc.get('description', '')}\n"
            f"Remarks: {doc.get('remarks', '')}"
        )

        contexts.append({
            "filename": doc.get("title", "Untitled"),
            "content": formatted_text,
            "score": hit.score
        })

    return contexts


# -------------------------------
# ✅ GEMINI CALL
# -------------------------------
def call_gemini(prompt: str) -> str:
    url = (
        f"https://generativelanguage.googleapis.com/v1/models/"
        f"{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY.strip()}"
    )

    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 1024
        }
    }

    try:
        resp = requests.post(url, json=payload, timeout=60)
        resp.raise_for_status()
        return resp.json()["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        return f"AI Error: {e}"


# -------------------------------
# ✅ FINAL ANSWER PIPELINE
# -------------------------------
def answer_question(
    query: str,
    tenant_id: str,
    role: str,
    user_id: str | None = None
) -> str:

    results = search_qdrant(
        query=query,
        tenant_id=tenant_id,
        role=role,
        user_id=user_id
    )

    if not results:
        return "I don't have any relevant information for your organization."

    context = "\n\n".join(
        f"[{i+1}] {r['filename']}\n{r['content']}"
        for i, r in enumerate(results)
    )

    prompt = f"""
        Answer ONLY using the information below.
        If unsure, say: "I don't know."

        Documents:
        {context}

        Question: {query}
        Answer:
        """

    return call_gemini(prompt)
