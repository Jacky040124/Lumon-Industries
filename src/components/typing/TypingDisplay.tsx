import './TypingDisplay.css';

interface TypingDisplayProps {
  lines: string[];
  pageStart: number;
  charsPerLine: number;
  typingStreamLength: number;
  highlightedRanges: Array<{ start: number; end: number }>;
  elapsedTime: number;
  collection: string[];
}

const TypingDisplay = ({
  lines,
  pageStart,
  charsPerLine,
  typingStreamLength,
  highlightedRanges,
  elapsedTime,
  collection,
}: TypingDisplayProps) => {
  // Calculate WPM
  const minutes = elapsedTime / 60 || 1; // Avoid division by zero
  const wpm = Math.round(collection.length / minutes);

  // Check if a character is highlighted
  const isCharHighlighted = (absoluteIndex: number): boolean => {
    return highlightedRanges.some(
      (range) => absoluteIndex >= range.start && absoluteIndex < range.end
    );
  };

  return (
    <div className="typing-display">
      {/* Stats Bar */}
      <div className="typing-stats">
        <div className="stat">
          <span className="stat-label">WPM:</span>
          <span className="stat-value">{wpm}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Words:</span>
          <span className="stat-value">{collection.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Time:</span>
          <span className="stat-value">
            {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Chars:</span>
          <span className="stat-value">{typingStreamLength}</span>
        </div>
      </div>

      {/* Typing Grid */}
      <div className="typing-grid">
        {lines.map((line, lineIndex) => {
          const lineStartIndex = pageStart + lineIndex * charsPerLine;
          return (
            <div key={lineIndex} className="typing-line">
              {Array.from({ length: charsPerLine }).map((_, charIndex) => {
                const absoluteIndex = lineStartIndex + charIndex;
                const char = line[charIndex];
                const isTyped = absoluteIndex < typingStreamLength;
                const isCursor = absoluteIndex === typingStreamLength;
                const isHighlighted = isCharHighlighted(absoluteIndex);

                return (
                  <div
                    key={charIndex}
                    className={`char-cell ${isTyped ? 'typed' : ''} ${
                      isCursor ? 'cursor' : ''
                    } ${isHighlighted ? 'highlighted' : ''}`}
                  >
                    {char || ' '}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TypingDisplay;

