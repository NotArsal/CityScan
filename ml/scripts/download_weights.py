import os
import sys

def main():
    print("=========================================")
    print("CityScan ML Weights Downloader")
    print("=========================================")
    
    weights_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "weights")
    os.makedirs(weights_dir, exist_ok=True)
    print(f"Weights will be cached in: {weights_dir}")

    # Set home directories
    os.environ["TORCH_HOME"] = weights_dir
    os.environ["SENTENCE_TRANSFORMERS_HOME"] = os.path.join(weights_dir, "sentence_transformers")

    # 1. Download PyTorch MobileNetV3
    print("\n1/2: Downloading MobileNetV3 Small weights...")
    try:
        import torch
        from torchvision.models import mobilenet_v3_small, MobileNet_V3_Small_Weights
        weights = MobileNet_V3_Small_Weights.DEFAULT
        mobilenet_v3_small(weights=weights)
        print("✅ MobileNetV3 Small weights loaded and cached.")
    except Exception as e:
        print(f"❌ Failed to download MobileNetV3: {e}")
        print("Image classification will run in fallback (mock) mode.")

    # 2. Download SentenceTransformer
    print("\n2/2: Downloading SentenceTransformer (all-MiniLM-L6-v2) weights...")
    try:
        from sentence_transformers import SentenceTransformer
        SentenceTransformer("all-MiniLM-L6-v2")
        print("✅ SentenceTransformer weights loaded and cached.")
    except ImportError:
        print("⚠️ sentence-transformers package is not installed. Run 'pip install sentence-transformers' first.")
    except Exception as e:
        print(f"❌ Failed to download SentenceTransformer: {e}")
        print("Duplicate text detection will run in fallback (keyword overlap) mode.")

    print("\n=========================================")
    print("Weight caching step complete.")
    print("=========================================")

if __name__ == "__main__":
    main()
