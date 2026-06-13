import os
import re
from typing import List, Dict

class CivicNLP:
    def __init__(self):
        self.enabled = False
        self.model = None

        try:
            # Set cache directory inside ml/weights
            weights_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "weights")
            os.makedirs(weights_dir, exist_ok=True)
            os.environ["SENTENCE_TRANSFORMERS_HOME"] = os.path.join(weights_dir, "sentence_transformers")

            # Load SentenceTransformer model
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer("all-MiniLM-L6-v2")
            self.enabled = True
            print("🚀 SentenceTransformer (all-MiniLM-L6-v2) loaded successfully for duplicate detection.")
        except Exception as e:
            print(f"⚠️ Failed to load SentenceTransformer: {e}")
            print("⚠️ Duplicate detection will run in fallback (keyword overlap) mode.")

    def calculate_urgency(self, text: str) -> Dict:
        """
        Calculates an urgency score between 0.0 and 1.0 based on keyword weighting.
        """
        text_lower = text.lower()
        
        # Urgency keywords with weights
        high_urgency = {
            "emergency": 0.5, "danger": 0.4, "accident": 0.4, "collapsed": 0.4,
            "flooding": 0.4, "flood": 0.3, "hazard": 0.3, "risk": 0.3, "injury": 0.4,
            "injured": 0.4, "falling": 0.3, "electric shock": 0.5, "wire hanging": 0.4,
            "sinkhole": 0.4, "toxic": 0.4, "explosion": 0.5, "fire": 0.5
        }
        
        medium_urgency = {
            "blocking": 0.2, "broken": 0.2, "leak": 0.2, "smell": 0.1, "stink": 0.1,
            "overflowing": 0.2, "dark": 0.1, "damage": 0.1, "pothole": 0.1, "garbage": 0.05,
            "street": 0.05, "water": 0.05
        }

        score = 0.0
        detected_keywords = []

        # Check high urgency keywords
        for kw, weight in high_urgency.items():
            if re.search(r'\b' + re.escape(kw) + r'\b', text_lower):
                score += weight
                detected_keywords.append(kw)

        # Check medium urgency keywords
        for kw, weight in medium_urgency.items():
            if re.search(r'\b' + re.escape(kw) + r'\b', text_lower):
                score += weight
                detected_keywords.append(kw)

        # Cap score at 1.0
        score = min(score, 1.0)
        
        return {
            "urgencyScore": round(score, 2),
            "urgencyKeywords": detected_keywords
        }

    def check_duplicate(self, new_text: str, existing_complaints: List[Dict]) -> Dict:
        """
        Checks if the new complaint description is a duplicate of any existing complaints in the same zone.
        """
        if not existing_complaints:
            return {
                "isDuplicate": False,
                "similarComplaintId": "",
                "similarity": 0.0
            }

        if self.enabled and self.model is not None:
            try:
                # Use SentenceTransformer embeddings
                from sentence_transformers import util
                
                texts = [c["text"] for c in existing_complaints]
                
                # Compute embeddings
                new_embedding = self.model.encode(new_text, convert_to_tensor=True)
                existing_embeddings = self.model.encode(texts, convert_to_tensor=True)
                
                # Compute cosine similarities
                cosine_scores = util.cos_sim(new_embedding, existing_embeddings)[0]
                
                # Find maximum similarity
                max_score_idx = int(cosine_scores.argmax().item())
                max_score = float(cosine_scores[max_score_idx].item())

                # Threshold: 0.70 (standard similarity cutoff for short texts)
                threshold = 0.70
                is_duplicate = max_score >= threshold
                similar_id = existing_complaints[max_score_idx]["id"] if is_duplicate else ""

                return {
                    "isDuplicate": is_duplicate,
                    "similarComplaintId": similar_id,
                    "similarity": round(max_score, 4)
                }
            except Exception as e:
                print(f"Error in SentenceTransformer duplicate check: {e}")
                # Fall through to keyword overlap fallback

        # Fallback keyword overlap (Jaccard similarity style)
        try:
            new_words = set(re.findall(r'\w+', new_text.lower()))
            if not new_words:
                return {"isDuplicate": False, "similarComplaintId": "", "similarity": 0.0}

            max_similarity = 0.0
            similar_id = ""

            for comp in existing_complaints:
                comp_words = set(re.findall(r'\w+', comp["text"].lower()))
                if not comp_words:
                    continue
                intersection = new_words.intersection(comp_words)
                union = new_words.union(comp_words)
                similarity = len(intersection) / len(union)

                if similarity > max_similarity:
                    max_similarity = similarity
                    similar_id = comp["id"]

            threshold = 0.50 # Lower threshold for simple token overlap
            is_duplicate = max_similarity >= threshold

            return {
                "isDuplicate": is_duplicate,
                "similarComplaintId": similar_id if is_duplicate else "",
                "similarity": round(max_similarity, 4),
                "is_fallback": True
            }
        except Exception as e:
            print(f"Error in fallback duplicate check: {e}")
            return {"isDuplicate": False, "similarComplaintId": "", "similarity": 0.0}

# Instantiate singleton NLP analyzer
nlp = CivicNLP()
