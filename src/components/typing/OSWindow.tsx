import type { ReactNode } from 'react';
import './OSWindow.css';

interface OSWindowProps {
  title: string;
  children: ReactNode;
  width?: string;
  height?: string;
  icon?: string;
}

const OSWindow = ({ title, children, width = '100%', height = '100%', icon }: OSWindowProps) => {
  return (
    <div className="os-window" style={{ width, height }}>
      {/* Window Title Bar */}
      <div className="os-window-titlebar">
        <div className="os-window-title">
          {icon && <span className="os-window-icon">{icon}</span>}
          <span>{title}</span>
        </div>
        <div className="os-window-controls">
          <button className="os-button os-minimize">_</button>
          <button className="os-button os-maximize">□</button>
          <button className="os-button os-close">×</button>
        </div>
      </div>

      {/* Window Content */}
      <div className="os-window-content">
        {children}
      </div>

      {/* Window Status Bar */}
      <div className="os-window-statusbar">
        <div className="os-statusbar-section">Ready</div>
      </div>
    </div>
  );
};

export default OSWindow;

