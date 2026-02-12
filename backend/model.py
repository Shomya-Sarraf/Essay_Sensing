import language_tool_python
import nltk
from transformers import pipeline

nltk.download('punkt')

tool = language_tool_python.LanguageTool('en-US')

# Optional transformer (can remove if slow)
sentiment_model = pipeline("sentiment-analysis")

def grade_essay(text):
    # Grammar score
    matches = tool.check(text)
    grammar_errors = len(matches)
    grammar_score = max(0, 10 - grammar_errors)

    # Vocabulary score
    words = text.split()
    unique_words = len(set(words))
    vocab_score = min(10, unique_words / 10)

    # Structure score
    sentences = nltk.sent_tokenize(text)
    structure_score = min(10, len(sentences))

    # Feedback
    feedback = []

    if grammar_errors > 5:
        feedback.append("Too many grammatical errors.")
    else:
        feedback.append("Grammar is good.")

    if unique_words < 50:
        feedback.append("Improve vocabulary variety.")
    else:
        feedback.append("Good vocabulary usage.")

    if len(sentences) < 5:
        feedback.append("Essay needs better structure.")
    else:
        feedback.append("Essay structure is clear.")

    return {
        "grammar_score": round(grammar_score, 2),
        "vocab_score": round(vocab_score, 2),
        "structure_score": round(structure_score, 2),
        "feedback": feedback
    }
