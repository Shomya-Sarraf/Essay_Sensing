import React, { useState, useRef, useEffect } from 'react';
import '../styles/EssayForm.css';

function EssayForm({ onSubmit, isLoading }) {

  const [essay, setEssay] = useState('');
  const [essayTitle, setEssayTitle] = useState('');
  const [wordCount, setWordCount] = useState(0);

  const textareaRef = useRef(null);

  const handleEssayChange = (e) => {
    const text = e.target.value;
    setEssay(text);

    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!essay.trim() || isLoading) return;

    try {
      const response = await fetch("http://127.0.0.1:8000/grade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: essay.trim() })
      });

      const data = await response.json();

      if (onSubmit) {
        onSubmit(data, essayTitle || "Untitled Essay"); // ✅ FIXED
      }

    } catch (error) {
      console.error("Error submitting essay:", error);
    }
  };

  const isSubmitDisabled = !essay.trim() || wordCount < 20 || isLoading;

  return (
    <div className="essay-form-container">
      <form onSubmit={handleSubmit} className="essay-form">

        <input
          type="text"
          value={essayTitle}
          onChange={(e) => setEssayTitle(e.target.value)}
          placeholder="Enter Essay Title"
          className="essay-title-input"
          disabled={isLoading}
        />

        <textarea
          ref={textareaRef}
          value={essay}
          onChange={handleEssayChange}
          placeholder="Write your essay here..."
          className="essay-textarea"
          rows={15}
          disabled={isLoading}
        />

        <div className="stats-bar">
          <span>{wordCount} words</span>
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={isSubmitDisabled}
        >
          {isLoading ? "Analyzing..." : "Get My Grade"}
        </button>

      </form>
    </div>
  );
}

export default EssayForm;
