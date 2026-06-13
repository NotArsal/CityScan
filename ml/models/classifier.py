import io
import torch
import torchvision.transforms as T
from torchvision.models import mobilenet_v3_small, MobileNet_V3_Small_Weights
from PIL import Image
import os

class CivicImageClassifier:
    def __init__(self):
        self.enabled = False
        self.model = None
        self.categories = []
        self.transforms = None

        try:
            # Set torch home to weights folder inside ml directory
            weights_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "weights")
            os.makedirs(weights_dir, exist_ok=True)
            os.environ["TORCH_HOME"] = weights_dir

            # Load MobileNetV3 Small (approx. 9MB, fast and lightweight)
            self.weights = MobileNet_V3_Small_Weights.DEFAULT
            self.model = mobilenet_v3_small(weights=self.weights)
            self.model.eval()

            # Get the ImageNet 1000 class labels
            self.categories = self.weights.meta["categories"]
            
            # Setup transforms
            self.transforms = self.weights.transforms()
            self.enabled = True
            print("🚀 MobileNetV3-Small loaded successfully for image classification.")
        except Exception as e:
            print(f"⚠️ Failed to load PyTorch MobileNetV3 model: {e}")
            print("⚠️ Image classifier will run in fallback (mock) mode.")

    def predict(self, image_bytes: bytes):
        if not self.enabled:
            # Fallback mock prediction
            return {"category": "garbage", "confidence": 0.50, "is_mock": True}

        try:
            # Load image from bytes
            img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            
            # Apply torchvision preprocess transforms
            input_tensor = self.transforms(img).unsqueeze(0)

            # Run inference without tracking gradients
            with torch.no_grad():
                output = self.model(input_tensor)
            
            # Calculate probabilities
            probabilities = torch.nn.functional.softmax(output[0], dim=0)
            
            # Get top 5 classes
            top5_prob, top5_catid = torch.topk(probabilities, 5)
            
            # Map top predictions to civic categories
            results = []
            for i in range(top5_prob.size(0)):
                prob = top5_prob[i].item()
                label = self.categories[top5_catid[i].item()].lower()
                results.append((label, prob))

            # Civic mapping logic based on keyword matching
            category = "other"
            max_conf = 0.0

            for label, prob in results:
                # 1. Pothole / Road damage keywords
                if any(k in label for k in ["pothole", "manhole", "paving", "stone", "tarmac", "asphalt", "tile"]):
                    category = "potholes"
                    max_conf = prob
                    break
                # 2. Garbage / Waste
                elif any(k in label for k in ["ashcan", "bin", "waste", "garbage", "trash", "rubbish", "plastic bag", "litter", "bag", "bottle"]):
                    category = "garbage"
                    max_conf = prob
                    break
                # 3. Water leak / plumbing
                elif any(k in label for k in ["water", "plumbing", "pipe", "conduit", "drain", "stream", "fountain"]):
                    category = "water"
                    max_conf = prob
                    break
                # 4. Streetlight / lamp post
                elif any(k in label for k in ["streetlamp", "lamp", "lantern", "post", "lightbulb", "light"]):
                    category = "streetlight"
                    max_conf = prob
                    break

            # If no keyword matched, assign the top prediction's category if it has moderate confidence, or mark as other
            if category == "other" and len(results) > 0:
                top_label, top_prob = results[0]
                category = "other"
                max_conf = top_prob

            return {
                "category": category,
                "confidence": round(max_conf, 4),
                "is_mock": False,
                "top_predictions": [{"label": l, "prob": round(p, 4)} for l, p in results]
            }

        except Exception as e:
            print(f"Error during image classification: {e}")
            return {"category": "other", "confidence": 0.0, "error": str(e)}

# Instantiate singleton classifier
classifier = CivicImageClassifier()
