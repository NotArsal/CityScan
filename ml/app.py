from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
from models.classifier import classifier
from models.nlp import nlp
from models.department import get_department_for_category

app = FastAPI(title="CityScan ML Service", version="1.0.0")

# CORS middleware for testing locally
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Text Request Model
class ComplaintTextRequest(BaseModel):
    text: str
    zone: str
    existingComplaints: Optional[List[Dict[str, str]]] = []

@app.post("/predict/image")
async def predict_image(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        prediction = classifier.predict(contents)
        
        # Determine department based on predicted category
        category = prediction.get("category", "other")
        department = get_department_for_category(category)
        
        return {
            "category": category,
            "confidence": prediction.get("confidence", 0.0),
            "department": department,
            "is_mock": prediction.get("is_mock", False),
            "top_predictions": prediction.get("top_predictions", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image prediction failed: {str(e)}")

@app.post("/predict/text")
async def predict_text(request: ComplaintTextRequest):
    try:
        # 1. Urgency Detection
        urgency_result = nlp.calculate_urgency(request.text)
        
        # 2. Duplicate Detection
        duplicate_result = nlp.check_duplicate(request.text, request.existingComplaints)
        
        return {
            "urgencyScore": urgency_result["urgencyScore"],
            "urgencyKeywords": urgency_result["urgencyKeywords"],
            "isDuplicate": duplicate_result["isDuplicate"],
            "similarComplaintId": duplicate_result["similarComplaintId"],
            "similarity": duplicate_result["similarity"],
            "is_fallback_nlp": duplicate_result.get("is_fallback", False)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text analysis failed: {str(e)}")

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "image_model_enabled": classifier.enabled,
        "nlp_model_enabled": nlp.enabled,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
