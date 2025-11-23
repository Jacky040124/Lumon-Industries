import OSWindow from '@/components/typing/OSWindow';
import TypingDisplay from '@/components/typing/TypingDisplay';
import './TypingOS.css';

interface TypingOSProps {
  typingStream: string;
  collection: string[];
  elapsedTime: number;
  isTyping: boolean;
  highlightedRanges: Array<{ start: number; end: number }>;
  lines: string[];
  pageStart: number;
  charsPerLine: number;
}

const TypingOS = (props: TypingOSProps) => {
  const { lines, pageStart, charsPerLine, highlightedRanges, elapsedTime, collection } = props;
  const typingStreamLength = props.typingStream.length;

  return (
    <div className="typing-os">
      {/* Desktop Background */}
      <div className="os-desktop">
        {/* Main Application Window */}
        <div className="os-app-window">
          <OSWindow title="Typer Monkey - Typing Test" icon="🐵">
            <TypingDisplay
              lines={lines}
              pageStart={pageStart}
              charsPerLine={charsPerLine}
              typingStreamLength={typingStreamLength}
              highlightedRanges={highlightedRanges}
              elapsedTime={elapsedTime}
              collection={collection}
            />
          </OSWindow>
        </div>

        {/* Taskbar */}
        <div className="os-taskbar">
          <button className="os-start-button">
            <span className="start-icon">⊞</span>
            Start
          </button>
          <div className="os-taskbar-apps">
            <button className="os-taskbar-app active">
              <span className="app-icon">🐵</span>
              Typer Monkey
            </button>
          </div>
          <div className="os-taskbar-tray">
            <div className="os-clock">
              {new Date().toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingOS;

