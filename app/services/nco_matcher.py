import json
import re
from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.models.taxonomy import NCOOccupation
from app.schemas.taxonomy import NCOMatchItem, NCOMatchResponse


class NCOSemanticMatcher:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            stop_words='english',
            max_features=5000
        )
        self.occupations: List[NCOOccupation] = []
        self.corpus: List[str] = []
        self.tfidf_matrix = None
        self.is_fitted = False

    def build_index(self, occupations: List[NCOOccupation]):
        """Build TF-IDF search index from NCO titles, alternate roles, and descriptions."""
        self.occupations = occupations
        self.corpus = []
        for occ in occupations:
            skills = " ".join(json.loads(occ.core_skills)) if occ.core_skills.startswith("[") else occ.core_skills
            text = f"{occ.title} {occ.typical_roles or ''} {occ.description} {skills}"
            self.corpus.append(text.lower())

        if self.corpus:
            self.tfidf_matrix = self.vectorizer.fit_transform(self.corpus)
            self.is_fitted = True

    def match(self, query_text: str, top_k: int = 3) -> NCOMatchResponse:
        """Match unstructured query text to closest official NCO-2015 occupations."""
        if not self.is_fitted or not self.occupations:
            return NCOMatchResponse(query_text=query_text, matches=[])

        query_clean = re.sub(r'[^a-zA-Z0-9\s]', ' ', query_text).lower()
        query_vec = self.vectorizer.transform([query_clean])
        similarities = cosine_similarity(query_vec, self.tfidf_matrix).flatten()

        # Get top-k indices sorted by similarity score
        top_indices = similarities.argsort()[::-1][:top_k]

        matches: List[NCOMatchItem] = []
        for idx in top_indices:
            score = float(similarities[idx])
            occ = self.occupations[idx]
            
            # Extract matched keywords/skills
            skills_list = json.loads(occ.core_skills) if occ.core_skills.startswith("[") else [occ.core_skills]
            matched_skills = [
                s for s in skills_list 
                if any(w in s.lower() for w in query_clean.split())
            ][:4]

            matches.append(
                NCOMatchItem(
                    nco_code=occ.nco_code,
                    title=occ.title,
                    sector_code=occ.sector_code,
                    nsqf_level=occ.nsqf_level,
                    similarity_score=round(max(score, 0.05) * 100, 1),
                    matched_skills=matched_skills or skills_list[:3],
                    is_emerging=occ.is_emerging,
                    is_legacy_at_risk=occ.is_legacy_at_risk
                )
            )

        return NCOMatchResponse(query_text=query_text, matches=matches)


nco_matcher_service = NCOSemanticMatcher()
