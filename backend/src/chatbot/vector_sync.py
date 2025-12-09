import uuid
import logging
import threading
import time
from config import model, qdrant, docs, COLLECTION_NAME
from qdrant_client.models import PointStruct
from bson import ObjectId

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("vector_sync")

def get_searchable_text(doc: dict) -> str:
    """
    Combine complaint fields into one context string for the LLM.
    """
    parts = [
        f"Title: {doc.get('title', '')}",
        f"Description: {doc.get('description', '')}",
        f"Category: {doc.get('category', '')}",
        f"Priority: {doc.get('priority', '')}",
        f"Status: {doc.get('status', '')}",
        f"Remarks: {doc.get('remarks', '')}"
    ]
    return " ".join(part for part in parts if part and not part.endswith(": ")).strip()

def upsert_vector(doc: dict):
    mongo_id = str(doc["_id"])   # ✅ stable ID

    text = get_searchable_text(doc)
    if not text.strip():
        return

    vector = model.encode(text).tolist()

    point = PointStruct(
        id=str(uuid.uuid4()),  # ✅ use Mongo ID (NOT random UUID)
        vector=vector,
        payload={
            "doc_id": str(mongo_id),

            # ✅ MULTI-TENANCY (CRITICAL)
            "tenant_id": str(doc.get("tenant_id")),

            # ✅ OWNERSHIP
            "submitted_by": str(doc.get("submitted_by", "")),
            "assigned_to": str(doc.get("assigned_to", "")),

            # ✅ SEARCH METADATA
            "category": doc.get("category", "General"),
            "priority": doc.get("priority", "Low"),
            "status": doc.get("status", "Open"),
            "title": doc.get("title", "Untitled Complaint"),
        }
    )

    qdrant.upsert(
        collection_name=COLLECTION_NAME,
        points=[point]
    )

    logger.info(f"✅ Vector synced | {mongo_id} | {doc.get('title')}")

def delete_vector(doc_id: str):
    qdrant.delete(
        collection_name=COLLECTION_NAME,
        points_selector=[str(doc_id)]
    )
    logger.info(f"🗑️ Deleted vector → {doc_id}")

def handle_change(change):
    op = change["operationType"]
    doc_id_str = str(change["documentKey"]["_id"])

    if op in ["insert", "update", "replace"]:
        full_doc = change.get("fullDocument")
        if not full_doc:
            full_doc = docs.find_one({"_id": ObjectId(doc_id_str)})
        if full_doc:
            upsert_vector(full_doc)

    elif op == "delete":
        delete_vector(doc_id_str)

def start_sync():
    logger.info("Starting real-time sync: complaint_db.complaints → Qdrant")
    resume_token = None
    while True:
        try:
            with docs.watch(resume_after=resume_token) as stream:
                for change in stream:
                    resume_token = stream.resume_token
                    threading.Thread(target=handle_change, args=(change,), daemon=True).start()
        except Exception as e:
            logger.error(f"Change stream error: {e}. Reconnecting in 5s...")
            time.sleep(5)

def run_background_sync():
    thread = threading.Thread(target=start_sync, daemon=True)
    thread.start()
    logger.info("Qdrant sync is running in background")