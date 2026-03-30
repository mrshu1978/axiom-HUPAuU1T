import React, { useEffect, useRef, useState } from 'react';
import TouchControls from './components/TouchControls';
import { GAME_WIDTH, GAME_HEIGHT } from './game/constants.js';

// Import Phaser scenes
import BootScene from './game/scenes/BootScene';
import PreloadScene from './game/scenes/PreloadScene';
import TitleScene from './game/scenes/TitleScene';
import GameScene from './game/scenes/GameScene';
import HUDScene from './game/scenes/HUDScene';
import GameOverScene from './game/scenes/GameOverScene';
import LevelCompleteScene from './game/scenes/LevelCompleteScene';

export default function App() {
  const gameRef = useRef(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // PWA install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Initialize Phaser game
    const initPhaser = async () => {
      const Phaser = await import('phaser');

      const config = {
        type: Phaser.AUTO,
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        backgroundColor: '#0D0D1A',
        parent: 'game-container',
        pixelArt: true,
        antialias: false,
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 0 },
            debug: false
          }
        },
        scene: [
          BootScene,
          PreloadScene,
          TitleScene,
          GameScene,
          HUDScene,
          GameOverScene,
          LevelCompleteScene
        ]
      };

      gameRef.current = new Phaser.Game(config);
    };

    initPhaser();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }

    setDeferredPrompt(null);
  };

  const containerStyle = {
    width: '100vw',
    height: '100vh',
    background: '#0D0D1A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  };

  const gameContainerStyle = {
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    maxWidth: '100%',
    imageRendering: 'pixelated'
  };

  const installBannerStyle = {
    position: 'fixed',
    bottom: '0',
    left: '0',
    right: '0',
    background: 'rgba(13, 13, 26, 0.95)',
    padding: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '2px solid #7B61FF',
    zIndex: 1000
  };

  const installButtonStyle = {
    background: '#7B61FF',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    fontWeight: 'bold',
    cursor: 'pointer'
  };

  const closeButtonStyle = {
    background: 'transparent',
    color: '#888',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '0 8px'
  };

  return (
    <div style={containerStyle}>
      <div id="game-container" style={gameContainerStyle} />
      <TouchControls />

      {showInstallBanner && (
        <div style={installBannerStyle}>
          <div style={{ color: 'white', fontSize: '14px' }}>
            Install Super Mario Bros — Axiom Edition for better experience
          </div>
          <div>
            <button style={installButtonStyle} onClick={handleInstallClick}>
              Install
            </button>
            <button
              style={closeButtonStyle}
              onClick={() => setShowInstallBanner(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}