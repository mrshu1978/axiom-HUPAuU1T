import React, { useState, useEffect } from 'react';

const TouchControls = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Check if touch device
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isMobileWidth = window.innerWidth < 768;
    setIsTouchDevice(hasTouch || isMobileWidth);
  }, []);

  const dispatchInputEvent = (action, pressed) => {
    const event = new CustomEvent('mario-input', {
      detail: { action, pressed }
    });
    window.dispatchEvent(event);
  };

  const handleTouchStart = (action) => (e) => {
    e.preventDefault();
    dispatchInputEvent(action, true);
  };

  const handleTouchEnd = (action) => (e) => {
    e.preventDefault();
    dispatchInputEvent(action, false);
  };

  if (!isTouchDevice) {
    return null;
  }

  const containerStyle = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '140px',
    zIndex: 100,
    pointerEvents: 'none',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: '16px'
  };

  const dpadStyle = {
    position: 'relative',
    width: '160px',
    height: '112px',
    pointerEvents: 'auto'
  };

  const buttonStyle = {
    position: 'absolute',
    width: '48px',
    height: '48px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    border: '2px solid rgba(255, 255, 255, 0.4)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '20px',
    fontWeight: 'bold',
    userSelect: 'none',
    touchAction: 'none'
  };

  const actionButtonsStyle = {
    display: 'flex',
    gap: '16px',
    pointerEvents: 'auto'
  };

  const actionButtonStyle = (color) => ({
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: color,
    border: '2px solid rgba(255, 255, 255, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '24px',
    fontWeight: 'bold',
    userSelect: 'none',
    touchAction: 'none'
  });

  return (
    <div style={containerStyle}>
      {/* D-pad */}
      <div style={dpadStyle}>
        <button
          style={{ ...buttonStyle, left: '16px', top: '48px' }}
          onTouchStart={handleTouchStart('left')}
          onTouchEnd={handleTouchEnd('left')}
          onTouchCancel={handleTouchEnd('left')}
        >
          ←
        </button>
        <button
          style={{ ...buttonStyle, left: '112px', top: '48px' }}
          onTouchStart={handleTouchStart('right')}
          onTouchEnd={handleTouchEnd('right')}
          onTouchCancel={handleTouchEnd('right')}
        >
          →
        </button>
        <button
          style={{ ...buttonStyle, left: '64px', top: '0' }}
          onTouchStart={handleTouchStart('jump')}
          onTouchEnd={handleTouchEnd('jump')}
          onTouchCancel={handleTouchEnd('jump')}
        >
          ↑
        </button>
        <button
          style={{ ...buttonStyle, left: '64px', top: '96px' }}
          onTouchStart={handleTouchStart('run')}
          onTouchEnd={handleTouchEnd('run')}
          onTouchCancel={handleTouchEnd('run')}
        >
          ↓
        </button>
      </div>

      {/* Action buttons */}
      <div style={actionButtonsStyle}>
        <button
          style={actionButtonStyle('#6B8CFF')}
          onTouchStart={handleTouchStart('fire')}
          onTouchEnd={handleTouchEnd('fire')}
          onTouchCancel={handleTouchEnd('fire')}
        >
          B
        </button>
        <button
          style={actionButtonStyle('#E52222')}
          onTouchStart={handleTouchStart('jump')}
          onTouchEnd={handleTouchEnd('jump')}
          onTouchCancel={handleTouchEnd('jump')}
        >
          A
        </button>
      </div>
    </div>
  );
};

export default TouchControls;