import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import EssayForm from './components/EssayForm.jsx';
import Results from './components/Results.jsx';
import Dashboard from './components/Dashboard.jsx';
import Features from './components/Features.jsx';
import './styles/App.css';

function App() {

  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [essayHistory, setEssayHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(true);

  // ✅ Added back userStats
  const [userStats, setUserStats] = useState({
    totalEssays: 0,
    averageScore: 0,
    totalWords: 0,
    totalReadingTime: 0,
    improvementRate: 0,
    streak: 0,
    lastSubmission: null
  });

  useEffect(() => {
    const savedHistory = localStorage.getItem('essayHistory');
    const savedTheme = localStorage.getItem('darkMode');

    if (savedHistory) {
      const parsed = JSON.parse(savedHistory);
      setEssayHistory(parsed);

      if (parsed.length > 0) {
        const avg = Math.round(
          parsed.reduce((sum, e) => sum + e.score, 0) / parsed.length
        );

        setUserStats(prev => ({
          ...prev,
          totalEssays: parsed.length,
          averageScore: avg
        }));
      }
    }

    if (savedTheme !== null) {
      setDarkMode(JSON.parse(savedTheme));
    }
  }, []);

  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : '';
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // ✅ HANDLE SUBMIT (Now accepts title too)
  const handleEssaySubmit = async (backendResult, essayTitle) => {
    setIsLoading(true);

    const rawScore =
  backendResult.grammar_score +
  backendResult.vocab_score +
  backendResult.structure_score;

// Convert 0–30 scale → 0–100 scale
const totalScore = Math.round((rawScore / 30) * 100);

    const newResult = {
      id: Date.now(),
      title: essayTitle, // ✅ FIXED
      score: totalScore,
      breakdown: {
        grammar: backendResult.grammar_score,
        vocabulary: backendResult.vocab_score,
        structure: backendResult.structure_score
      },
      feedback: {
        strengths: [],
        improvements: backendResult.feedback,
        summary: "AI-powered evaluation based on grammar, structure and vocabulary."
      },
      gradedAt: new Date().toLocaleString(),
      wordCount: backendResult.word_count || 0,
      readingTime: backendResult.reading_time || 0,
   category: totalScore >= 90 ? "excellent"
         : totalScore >= 80 ? "good"
         : totalScore >= 70 ? "average"
         : "needs-improvement",

      grade: totalScore >= 90 ? "A"
      : totalScore >= 80 ? "B"
      : totalScore >= 70 ? "C"
      : totalScore >= 60 ? "D"
      : "F"

    };

    setResult(newResult);

    const updatedHistory = [newResult, ...essayHistory.slice(0, 19)];
    setEssayHistory(updatedHistory);
    localStorage.setItem('essayHistory', JSON.stringify(updatedHistory));

    // ✅ Update Stats
    const totalEssays = updatedHistory.length;
    const averageScore = Math.round(
      updatedHistory.reduce((sum, e) => sum + e.score, 0) / totalEssays
    );

    setUserStats(prev => ({
      ...prev,
      totalEssays,
      averageScore,
      lastSubmission: new Date().toLocaleString()
    }));

    setIsLoading(false);
    setCurrentView('results');
  };

  const clearAllData = () => {
    if (window.confirm("Are you sure you want to clear all data?")) {
      setEssayHistory([]);
      setUserStats({
        totalEssays: 0,
        averageScore: 0,
        totalWords: 0,
        totalReadingTime: 0,
        improvementRate: 0,
        streak: 0,
        lastSubmission: null
      });
      localStorage.removeItem('essayHistory');
    }
  };

  const handleNewEssay = () => {
    setResult(null);
    setCurrentView('home');
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
    if (view !== 'results') setResult(null);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            history={essayHistory}
            userStats={userStats}
            onViewEssay={(essay) => {
              setResult(essay);
              setCurrentView('results');
            }}
            onClearData={clearAllData}
          />
        );
      case 'features':
        return <Features />;
      case 'results':
        return <Results result={result} onNewEssay={handleNewEssay} />;
      default:
        return <EssayForm onSubmit={handleEssaySubmit} isLoading={isLoading} />;
    }
  };

  return (
  <div className="app">


  <Header
    currentView={currentView}
    onViewChange={handleViewChange}
    darkMode={darkMode}
    onToggleDarkMode={toggleDarkMode}
  />

  <div className="container">
    <main className="content-area">
      {renderCurrentView()}
    </main>
  </div>

</div>

  );
}

export default App;
