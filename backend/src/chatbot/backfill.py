import uuid
from config import docs, model, qdrant, COLLECTION_NAME
from qdrant_client import models
from qdrant_client.models import PointStruct
from vector_sync import get_searchable_text



print(f"🚀 Backfilling collection '{COLLECTION_NAME}' → Qdrant")

# ---------------------------------
# Create / reset collection
# ---------------------------------
if qdrant.collection_exists(COLLECTION_NAME):
    print("⚠️ Collection exists → deleting")
    qdrant.delete_collection(collection_name=COLLECTION_NAME)

print("✅ Creating collection")
qdrant.create_collection(
    collection_name=COLLECTION_NAME,
    vectors_config=models.VectorParams(
        size=384,                      # all-MiniLM-L6-v2
        distance=models.Distance.COSINE
    )
)

# ---------------------------------
# Backfill documents
# ---------------------------------
count = 0

for doc in docs.find():
    mongo_id = str(doc["_id"])

    text = get_searchable_text(doc)
    if not text.strip():
        continue

    vector = model.encode(text).tolist()

    # ✅ Qdrant requires UUID or int as point ID
    point_id = str(uuid.uuid4())

    point = PointStruct(
        id=point_id,                  # ✅ VALID QDRANT ID
        vector=vector,
        payload={
            # ---------------------------
            # REQUIRED REFERENCES
            # ---------------------------
            "doc_id": mongo_id,        # Mongo reference
            "tenant_id": str(doc.get("tenantId")),  # MULTI-TENANCY

            # ---------------------------
            # ACCESS CONTROL
            # ---------------------------
            "submitted_by": str(doc.get("submitted_by", "")),
            "assigned_to": str(doc.get("assigned_to", "")),

            # ---------------------------
            # SEARCH METADATA
            # ---------------------------
            "title": doc.get("title", "Untitled Complaint"),
            "category": doc.get("category", "General"),
            "priority": doc.get("priority", "Low"),
            "status": doc.get("status", "Open"),
        }
    )
    print("DEBUG QDRANT ID:", point.id) 
    qdrant.upsert(
        collection_name=COLLECTION_NAME,
        points=[point],
        wait=True
    )

    count += 1
    print(f"✅ [{count}] Indexed → {doc.get('title', 'Untitled')}")

print(f"\n🎉 Backfill complete — {count} documents indexed.")
