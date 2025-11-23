import { useState, useCallback, useRef, useEffect } from "react";
import Monkey from "@/components/typing/Monkey";
import Collection from "@/components/typing/Collection";
import TypingControls from "@/components/typing/TypingControls";
import Auth from "@/components/auth/Auth";
import AvatarButton from "@/components/profile/AvatarButton";
import GitHubStarButton from "@/components/profile/GitHubStarButton";
import { useAuth } from "@/contexts/AuthContext";
import { isValidWord } from "@/utils/wordDetector";
import { TYPING_SPEED_MS, MAX_WORD_LENGTH } from "@/models/constants/typing";
import type { HighlightedRange } from "@/models/typing";
import "./App.css";

function App() {
  const { user, loading } = useAuth();
  const [isTyping, setIsTyping] = useState(false);
  const [typingStream, setTypingStream] = useState("");
  const [collection, setCollection] = useState<string[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [targetTime, setTargetTime] = useState<number | null>(null);
  const [isTimerStarting, setIsTimerStarting] = useState(false);

  const [leadingWord, setLeadingWord] = useState<string | null>(null);
  const [highlightedRanges, setHighlightedRanges] = useState<HighlightedRange[]>([]);
  const collectionSetRef = useRef<Set<string>>(new Set());
  const collectionButtonRef = useRef<HTMLDivElement>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const longPressCompletedRef = useRef(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [longPressProgress, setLongPressProgress] = useState(0);
  const longPressStartTimeRef = useRef<number | null>(null);
  const longPressProgressIntervalRef = useRef<number | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [devMode, setDevMode] = useState(true);

  const handleKeystroke = useCallback((char: string) => {
    let newWord: string | null = null;
    let wordStartIndex = 0;
    let wordEndIndex = 0;

    setTypingStream((prev) => {
      const newStream = prev + char.toLowerCase();
      const currentLength = newStream.length;

      // Since we're only typing letters now, check for valid words ending at current position
      // Check all possible word endings from the end of the stream (longest first, up to MAX_WORD_LENGTH chars)
      const streamEnd = newStream.slice(-MAX_WORD_LENGTH);

      // Check for valid words ending at the current position
      for (let length = Math.min(streamEnd.length, MAX_WORD_LENGTH); length >= 1; length--) {
        const candidateWord = streamEnd.slice(-length);
        if (isValidWord(candidateWord) && !collectionSetRef.current.has(candidateWord)) {
          collectionSetRef.current.add(candidateWord);
          newWord = candidateWord;
          wordStartIndex = currentLength - length;
          wordEndIndex = currentLength;
          break; // Found a word, stop checking shorter ones
        }
      }

      return newStream;
    });

    // Update collection state outside of setTypingStream callback
    if (newWord !== null) {
      const word: string = newWord; // Type guard for TypeScript
      const updatedCollection: string[] = Array.from(collectionSetRef.current);
      setCollection(updatedCollection);

      // Add highlighted range for the detected word
      setHighlightedRanges((prev) => [...prev, { start: wordStartIndex, end: wordEndIndex }]);

      // Update leading word (longest word)
      // If a new word equals the length of the existing longest word, replace it with the new one
      // Find the maximum length in the collection
      const maxLength = updatedCollection.length > 0 ? Math.max(...updatedCollection.map((w: string) => w.length)) : 0;

      if (word.length === maxLength) {
        // New word equals the longest length, replace with new one
        setLeadingWord(word);
      } else {
        // Find the longest word (or keep current if new word is shorter)
        const longestWord = updatedCollection.reduce(
          (longest: string | null, w: string) => (w.length > (longest?.length || 0) ? w : longest),
          updatedCollection[0] || null
        );
        setLeadingWord(longestWord);
      }
    }
  }, []);

  const handleStart = () => {
    // Trigger animation
    setIsTimerStarting(true);

    // Start timer after animation completes
    setTimeout(() => {
      setIsTimerStarting(false);
      // If we have a target time set, use countdown mode
      if (targetTime !== null && targetTime > 0) {
        setIsTyping(true);
        startTimeRef.current = Date.now();
        timerIntervalRef.current = setInterval(() => {
          if (startTimeRef.current) {
            const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
            const remaining = Math.max(0, targetTime - elapsed);
            setElapsedTime(remaining);

            // Stop typing when countdown reaches 0
            if (remaining === 0) {
              handleStop();
            }
          }
        }, 100);
      } else {
        // Original count-up mode
        setIsTyping(true);
        startTimeRef.current = Date.now() - elapsedTime * 1000;
        timerIntervalRef.current = setInterval(() => {
          if (startTimeRef.current) {
            setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
          }
        }, 100);
      }
    }, 600); // Match animation duration
  };

  const handleStop = () => {
    setIsTyping(false);
    setIsTimerStarting(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const handleReset = () => {
    setIsTyping(false);
    setIsTimerStarting(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    // Reset to selected target time if one was set, otherwise 0
    setElapsedTime(targetTime !== null ? targetTime : 0);
    setTypingStream("");
    setCollection([]);
    setLeadingWord(null);
    setHighlightedRanges([]);
    collectionSetRef.current.clear();
    startTimeRef.current = null;
  };

  const handleButtonPressStart = () => {
    longPressCompletedRef.current = false;
    if (isTyping) {
      // Reset progress
      setLongPressProgress(0);
      longPressStartTimeRef.current = Date.now();

      // Start progress animation
      longPressProgressIntervalRef.current = window.setInterval(() => {
        if (longPressStartTimeRef.current) {
          const elapsed = Date.now() - longPressStartTimeRef.current;
          const progress = Math.min(100, (elapsed / 1500) * 100);
          setLongPressProgress(progress);
        }
      }, 16); // ~60fps

      // Start long press timer for stop button
      longPressTimerRef.current = window.setTimeout(() => {
        setIsLongPressing(true);
        longPressCompletedRef.current = true;
        setLongPressProgress(100);
        handleReset();
        // Delay resetting the visual state slightly
        setTimeout(() => {
          setIsLongPressing(false);
          setLongPressProgress(0);
        }, 100);
      }, 1500);
    }
  };

  const handleButtonPressEnd = () => {
    const wasLongPress = longPressCompletedRef.current;

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Clear progress interval
    if (longPressProgressIntervalRef.current) {
      clearInterval(longPressProgressIntervalRef.current);
      longPressProgressIntervalRef.current = null;
    }

    // Only trigger normal click if long press wasn't completed
    if (!wasLongPress && !isLongPressing) {
      // Normal click
      if (isTyping) {
        handleStop();
      } else {
        handleStart();
      }
    }

    // Reset states
    setIsLongPressing(false);
    setLongPressProgress(0);
    longPressStartTimeRef.current = null;
    longPressCompletedRef.current = false;
  };

  const handleButtonPressCancel = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Clear progress interval
    if (longPressProgressIntervalRef.current) {
      clearInterval(longPressProgressIntervalRef.current);
      longPressProgressIntervalRef.current = null;
    }

    setIsLongPressing(false);
    setLongPressProgress(0);
    longPressStartTimeRef.current = null;
    longPressCompletedRef.current = false;
  };

  // Handle preset duration selection
  const handleDurationSelect = (seconds: number) => {
    if (!isTyping) {
      setTargetTime(seconds);
      setElapsedTime(seconds);
    }
  };

  // Bridge state to vanilla Three.js app
  useEffect(() => {
    if (window.threeApp) {
      window.threeApp.updateTypingState({
        isTyping,
        typingStream,
        collection,
        elapsedTime,
        highlightedRanges,
      });
    }
  }, [isTyping, typingStream, collection, elapsedTime, highlightedRanges]);

  // Sync dev mode state on mount
  useEffect(() => {
    if (window.threeApp) {
      setDevMode(window.threeApp.getDevMode());
    }
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
      if (longPressProgressIntervalRef.current) {
        clearInterval(longPressProgressIntervalRef.current);
      }
    };
  }, []);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="app">
        <div style={{ textAlign: "center", padding: "2rem" }}>Loading...</div>
      </div>
    );
  }

  // Show auth UI if not logged in
  if (!user) {
    return <Auth />;
  }

  const handleToggleDevMode = () => {
    if (window.threeApp) {
      const newState = window.threeApp.toggleDevMode();
      setDevMode(newState);
    }
  };

  return (
    <div className="app">
      <div className="header-controls">
        <GitHubStarButton repoUrl="https://github.com/Jacky040124/typer-monkey" repoName="typer-monkey" />
        <AvatarButton onModalOpenChange={setIsProfileModalOpen} />
        <button
          onClick={handleToggleDevMode}
          className="dev-mode-button"
          style={{
            padding: '0.5rem 0.875rem',
            fontSize: '0.875rem',
            backgroundColor: devMode ? '#4caf50' : '#fff',
            color: devMode ? '#fff' : '#1a1a1a',
            border: `1px solid ${devMode ? '#4caf50' : '#e0e0e0'}`,
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            fontFamily: 'inherit',
            height: '40px',
            lineHeight: '1',
          }}
          onMouseEnter={(e) => {
            if (!devMode) {
              e.currentTarget.style.background = '#f5f5f5';
              e.currentTarget.style.borderColor = '#d0d0d0';
            }
          }}
          onMouseLeave={(e) => {
            if (!devMode) {
              e.currentTarget.style.background = '#fff';
              e.currentTarget.style.borderColor = '#e0e0e0';
            }
          }}
        >
          {devMode ? 'Dev Mode ON' : 'Dev Mode'}
        </button>
      </div>
      <header className="header">
        <h1>Typer Monkey</h1>
        <p className="subtitle">Watch the monkey type and collect English words</p>
      </header>

      <TypingControls
        leadingWord={leadingWord}
        elapsedTime={elapsedTime}
        isTimerStarting={isTimerStarting}
        isTyping={isTyping}
        isLongPressing={isLongPressing}
        longPressProgress={longPressProgress}
        targetTime={targetTime}
        startTimeRef={startTimeRef}
        onButtonPressStart={handleButtonPressStart}
        onButtonPressEnd={handleButtonPressEnd}
        onButtonPressCancel={handleButtonPressCancel}
        onDurationSelect={handleDurationSelect}
      />

      <div className="main-layout">
        {/* Hidden 2D Monkey for keystroke generation */}
        <div style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}>
          <Monkey isTyping={isTyping} typingSpeed={TYPING_SPEED_MS} onKeystroke={handleKeystroke} />
        </div>
      </div>

      {!isProfileModalOpen && <Collection words={collection} ref={collectionButtonRef} />}
    </div>
  );
}

export default App;
