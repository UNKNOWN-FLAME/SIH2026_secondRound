from typing import Dict, Any

# Simple in-memory translation dictionary for demonstration purposes.
# In production, this would use gettext or a dedicated i18n library 
# loading from .po/.mo or JSON files.

TRANSLATIONS: Dict[str, Dict[str, str]] = {
    "en": {
        "whatsapp_greeting": "Namaste! 🙏 MSDE Kaushal Matchmaker has registered your requirement for",
        "whatsapp_candidates_found": "Here are {count} verified, certified candidates available near your site:",
        "whatsapp_candidate_row": "{idx}. *{name}* (NSQF L{nsqf})\n   Cert: {cert}\n   Phone: {phone} ({dist} km away)\n",
        "whatsapp_footer": "\nYour demand has been fed directly to the MSDE District Skilling Target Planning System. Dhanyawad!"
    },
    "hi": {
        "whatsapp_greeting": "नमस्ते! 🙏 MSDE कौशल मैचमेकर ने आपकी आवश्यकता दर्ज कर ली है:",
        "whatsapp_candidates_found": "आपके साइट के पास {count} सत्यापित और प्रमाणित उम्मीदवार उपलब्ध हैं:",
        "whatsapp_candidate_row": "{idx}. *{name}* (NSQF L{nsqf})\n   प्रमाणपत्र: {cert}\n   फ़ोन: {phone} ({dist} किमी दूर)\n",
        "whatsapp_footer": "\nआपकी मांग सीधे MSDE जिला कौशल लक्ष्य योजना प्रणाली में दर्ज कर दी गई है। धन्यवाद!"
    }
}

def translate(key: str, lang: str = "en", **kwargs: Any) -> str:
    """
    Retrieve and format a localized string based on the language code.
    Fallback to English if the key or language is not found.
    """
    lang_dict = TRANSLATIONS.get(lang, TRANSLATIONS["en"])
    template = lang_dict.get(key, TRANSLATIONS["en"].get(key, key))
    
    try:
        return template.format(**kwargs)
    except KeyError:
        return template
