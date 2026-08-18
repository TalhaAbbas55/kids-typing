import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './TypingGame.css';

// Keyboard layouts (moved outside to prevent recreating on every render)
const keyboardRows = {
  top: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  middle: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
  bottom: ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
  numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
};

// Bubble colors (moved outside to prevent recreating on every render)
const bubbleColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
  '#98D8C8', '#FFD93D', '#FF90E8', '#A8E6CF',
  '#FFB6D9', '#B4A7D6', '#90EE90', '#FFB347'
];

const TypingGame = () => {
  const [bubbles, setBubbles] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [poppedBubbles, setPoppedBubbles] = useState([]);
  const [celebrationEmojis, setCelebrationEmojis] = useState([]);
  const [wrongKeyEffects, setWrongKeyEffects] = useState([]);
  const [screenShake, setScreenShake] = useState(false);
  const [settings, setSettings] = useState({
    topRow: true,
    middleRow: false,
    bottomRow: false,
    numbers: false,
    uppercase: false,
    speed: 2, // 1-14 scale, 1 = ultra slow, 14 = very fast
    removeSpecialChars: true,
  });

  // Sound effects using Web Audio API
  const playCorrectSound = useCallback(() => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const sounds = [
      // Happy pop sounds - different frequencies
      { freq: 523.25, duration: 0.15 }, // C5
      { freq: 659.25, duration: 0.15 }, // E5
      { freq: 783.99, duration: 0.15 }, // G5
      { freq: 880.00, duration: 0.15 }, // A5
      { freq: 1046.50, duration: 0.12 }, // C6
    ];
    
    const sound = sounds[Math.floor(Math.random() * sounds.length)];
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = sound.freq;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + sound.duration);
  }, []);

  const playWrongSound = useCallback(() => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const sounds = [
      // Error sounds - lower, dissonant frequencies
      { freq: 200, duration: 0.2 },
      { freq: 180, duration: 0.25 },
      { freq: 150, duration: 0.22 },
      { freq: 220, duration: 0.18 },
    ];
    
    const sound = sounds[Math.floor(Math.random() * sounds.length)];
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = sound.freq;
    oscillator.type = 'sawtooth';
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + sound.duration);
  }, []);

  // Get available keys based on settings
  const getAvailableKeys = useCallback(() => {
    let keys = [];
    if (settings.topRow) keys = [...keys, ...keyboardRows.top];
    if (settings.middleRow) {
      let middleKeys = [...keyboardRows.middle];
      if (settings.removeSpecialChars) {
        middleKeys = middleKeys.filter(key => key !== ';');
      }
      keys = [...keys, ...middleKeys];
    }
    if (settings.bottomRow) keys = [...keys, ...keyboardRows.bottom];
    if (settings.numbers) keys = [...keys, ...keyboardRows.numbers];

    if (settings.uppercase) {
      keys = keys.map(key => key.toUpperCase());
    }

    return keys.length > 0 ? keys : ['a', 'b', 'c']; // fallback
  }, [settings]);

  // Background gradients
  const backgrounds = useMemo(() => [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  ], []);

  const [currentBackground, setCurrentBackground] = useState(0);

  // Change background periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBackground(prev => (prev + 1) % backgrounds.length);
    }, 30000); // Change every 30 seconds
    return () => clearInterval(interval);
  }, [backgrounds.length]);

  // Generate bubbles
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    
    const availableKeys = getAvailableKeys();
    
    // Calculate spawn interval based on speed (1-14)
    // Speed 1 = 5700ms (ultra slow), Speed 14 = 1800ms (fast)
    const baseInterval = 6000 - (settings.speed * 300);
    
    const spawnBubble = () => {
      const newBubble = {
        id: Date.now() + Math.random(),
        letter: availableKeys[Math.floor(Math.random() * availableKeys.length)],
        color: bubbleColors[Math.floor(Math.random() * bubbleColors.length)],
        x: Math.random() * 80 + 10, // 10% to 90% of screen width
        startTime: Date.now(),
        // Duration in seconds - slower speeds = longer duration
        duration: Math.max(10, 28 - settings.speed * 1.3),
      };
      
      setBubbles(prev => [...prev, newBubble]);
    };

    const interval = setInterval(spawnBubble, baseInterval);
    return () => clearInterval(interval);
  }, [settings, getAvailableKeys, gameStarted, gameOver]);

  // Remove bubbles that reach the top and lose a life
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    
    const checkBubbles = setInterval(() => {
      setBubbles(prev => {
        const now = Date.now();
        const bubblesReachedTop = [];
        const remainingBubbles = prev.filter(bubble => {
          const age = (now - bubble.startTime) / 1000;
          if (age >= bubble.duration) {
            bubblesReachedTop.push(bubble);
            return false;
          }
          return true;
        });
        
        // Lose a life for each bubble that reached the top
        if (bubblesReachedTop.length > 0) {
          setLives(currentLives => {
            const newLives = Math.max(0, currentLives - bubblesReachedTop.length);
            if (newLives === 0) {
              setGameOver(true);
              if (score > highScore) {
                setHighScore(score);
              }
            }
            return newLives;
          });
        }
        
        return remainingBubbles;
      });
    }, 100);
    return () => clearInterval(checkBubbles);
  }, [gameOver, score, highScore, gameStarted]);

  // Handle key press
  const handleKeyPress = useCallback((event) => {
    if (!gameStarted || gameOver) return;
    
    const key = settings.uppercase ? event.key.toUpperCase() : event.key.toLowerCase();
    
    setBubbles(prev => {
      const bubbleIndex = prev.findIndex(b => b.letter === key);
      if (bubbleIndex !== -1) {
        const poppedBubble = prev[bubbleIndex];
        
        // Calculate current position of bubble (from bottom to top)
        const now = Date.now();
        const age = (now - poppedBubble.startTime) / 1000;
        const progress = Math.min(age / poppedBubble.duration, 1);
        // Animation goes from bottom: -100px to bottom: 100vh
        // Start position in vh: -100px converted to vh
        const startVh = (-100 / window.innerHeight) * 100;
        const endVh = 100;
        // Linear interpolation between start and end
        const currentBottomVh = startVh + (progress * (endVh - startVh));
        
        // Add to popped bubbles for animation at current position
        setPoppedBubbles(current => [...current, {
          ...poppedBubble,
          poppedAt: now,
          bottomVh: currentBottomVh
        }]);

        // Add celebration emoji at current position
        setCelebrationEmojis(current => [...current, {
          id: now + Math.random(),
          x: poppedBubble.x,
          bottomVh: currentBottomVh,
          emoji: ['🎉', '⭐', '✨', '🌟', '💫', '🎊'][Math.floor(Math.random() * 6)]
        }]);

        // Increase score
        setScore(s => s + 1);

        // Play correct sound
        playCorrectSound();

        // Remove the bubble
        return prev.filter((_, index) => index !== bubbleIndex);
      } else {
        // Wrong key pressed - lose half a life
        setLives(currentLives => {
          const newLives = Math.max(0, currentLives - 0.5);
          if (newLives === 0) {
            setGameOver(true);
            if (score > highScore) {
              setHighScore(score);
            }
          }
          return newLives;
        });

        // Play wrong sound
        playWrongSound();

        // Add visual warning effect
        setWrongKeyEffects(current => [...current, {
          id: Date.now() + Math.random(),
          x: Math.random() * 80 + 10,
          key: key
        }]);

        // Trigger screen shake
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 300);
      }
      return prev;
    });
  }, [settings.uppercase, gameOver, gameStarted, score, highScore, playCorrectSound, playWrongSound]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Clean up popped bubbles and wrong key effects after animation
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setPoppedBubbles(prev => prev.filter(b => now - b.poppedAt < 800));
      setCelebrationEmojis(prev => prev.filter(e => now - e.id < 1500));
      setWrongKeyEffects(prev => prev.filter(e => now - e.id < 1000));
    }, 100);
    return () => clearInterval(cleanup);
  }, []);

  // Start game
  const startGame = () => {
    setGameStarted(true);
    setBubbles([]);
    setScore(0);
    setLives(3);
    setGameOver(false);
    setPoppedBubbles([]);
    setCelebrationEmojis([]);
  };

  // Restart game
  const restartGame = () => {
    setGameStarted(true);
    setBubbles([]);
    setScore(0);
    setLives(3);
    setGameOver(false);
    setPoppedBubbles([]);
    setCelebrationEmojis([]);
  };

  return (
    <div 
      className={`game-container ${screenShake ? 'shake' : ''}`}
      style={{ background: backgrounds[currentBackground] }}
    >
      {/* Settings Panel */}
      <div className="settings-panel">
        <h3>⚙️ Settings</h3>
        
        <div className="setting-group">
          <label className="setting-label">Keyboard Rows:</label>
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={settings.topRow}
                onChange={(e) => setSettings({...settings, topRow: e.target.checked})}
              />
              Top Row (QWERTY)
            </label>
            <label>
              <input
                type="checkbox"
                checked={settings.middleRow}
                onChange={(e) => setSettings({...settings, middleRow: e.target.checked})}
              />
              Middle Row (ASDFG)
            </label>
            <label>
              <input
                type="checkbox"
                checked={settings.bottomRow}
                onChange={(e) => setSettings({...settings, bottomRow: e.target.checked})}
              />
              Bottom Row (ZXCV)
            </label>
            <label>
              <input
                type="checkbox"
                checked={settings.numbers}
                onChange={(e) => setSettings({...settings, numbers: e.target.checked})}
              />
              Numbers (0-9)
            </label>
          </div>
        </div>

        {settings.middleRow && (
          <div className="setting-group">
            <label>
              <input
                type="checkbox"
                checked={settings.removeSpecialChars}
                onChange={(e) => setSettings({...settings, removeSpecialChars: e.target.checked})}
              />
              Remove Special Characters (;)
            </label>
          </div>
        )}

        <div className="setting-group">
          <label>
            <input
              type="checkbox"
              checked={settings.uppercase}
              onChange={(e) => setSettings({...settings, uppercase: e.target.checked})}
            />
            Uppercase Letters
          </label>
        </div>

        <div className="setting-group">
          <label className="setting-label">
            Bubble Speed: {settings.speed}
            <span className="speed-label">
              {settings.speed <= 2 ? '🦥 Ultra Slow' : 
               settings.speed <= 4 ? '🐢 Very Slow' : 
               settings.speed <= 6 ? '🐌 Slow' :
               settings.speed <= 8 ? '🚶 Medium' :
               settings.speed <= 10 ? '🏃 Fast' :
               settings.speed <= 12 ? '🚀 Very Fast' : '⚡ Super Fast'}
            </span>
          </label>
          <input
            type="range"
            min="1"
            max="14"
            value={settings.speed}
            onChange={(e) => setSettings({...settings, speed: parseInt(e.target.value)})}
            className="speed-slider"
          />
        </div>

        {!gameStarted && (
          <button className="start-button" onClick={startGame}>
            🎮 Start Game
          </button>
        )}
      </div>

      {/* Score & Lives Display */}
      <div className="score-display">
        <h1>🎈 Score: {score}</h1>
        <div className="lives-display">
          {[...Array(3)].map((_, i) => {
            const heartValue = i + 1;
            let heartDisplay = '🖤';
            if (lives >= heartValue) {
              heartDisplay = '❤️';
            } else if (lives >= heartValue - 0.5) {
              heartDisplay = '💔';
            }
            return (
              <span key={i} className={lives >= heartValue - 0.5 ? 'heart active' : 'heart'}>
                {heartDisplay}
              </span>
            );
          })}
        </div>
        {highScore > 0 && (
          <div className="high-score">🏆 Best: {highScore}</div>
        )}
      </div>

      {/* Game Over Screen */}
      {gameOver && (
        <motion.div
          className="game-over-overlay"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="game-over-content">
            <h1>🎮 Game Over!</h1>
            <p className="final-score">Final Score: {score}</p>
            {score === highScore && score > 0 && (
              <p className="new-high-score">🎉 New High Score! 🎉</p>
            )}
            <button className="restart-button" onClick={restartGame}>
              🔄 Play Again
            </button>
          </div>
        </motion.div>
      )}

      {/* Game Area */}
      <div className="game-area">
        <AnimatePresence mode="popLayout">
          {bubbles.map(bubble => (
            <motion.div
              key={bubble.id}
              className="bubble"
              initial={{ bottom: '-100px', scale: 0.5, opacity: 0 }}
              animate={{ 
                bottom: '100vh',
                scale: 1,
                opacity: 1,
              }}
              exit={{ scale: 0, opacity: 0, transition: { duration: 0.1 } }}
              transition={{ 
                duration: bubble.duration,
                ease: 'linear'
              }}
              style={{
                left: `${bubble.x}%`,
                backgroundColor: bubble.color,
                position: 'absolute',
              }}
            >
              <span className="bubble-letter">{bubble.letter}</span>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Popped Bubble Animations */}
        <AnimatePresence>
          {poppedBubbles.map(bubble => (
            <motion.div
              key={bubble.id + '-popped'}
              className="bubble-pop"
              initial={{ scale: 1, opacity: 1, rotate: 0 }}
              animate={{ scale: 3, opacity: 0, rotate: 180 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{
                left: `${bubble.x}%`,
                bottom: `${bubble.bottomVh}vh`,
                position: 'absolute',
                fontSize: '60px',
                pointerEvents: 'none',
              }}
            >
              💥
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Celebration Emojis */}
        <AnimatePresence>
          {celebrationEmojis.map(emoji => (
            <motion.div
              key={emoji.id}
              className="celebration-emoji"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ 
                scale: [0, 1.5, 1], 
                y: [-20, -60, -100],
                opacity: [1, 1, 0],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{
                left: `${emoji.x}%`,
                bottom: `${emoji.bottomVh}vh`,
                position: 'absolute',
                fontSize: '50px',
                pointerEvents: 'none',
              }}
            >
              {emoji.emoji}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Wrong Key Effects */}
        <AnimatePresence>
          {wrongKeyEffects.map(effect => (
            <motion.div
              key={effect.id}
              className="wrong-key-effect"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ 
                scale: [0, 1.5, 0],
                opacity: [1, 1, 0],
                y: [-20, -80, -120]
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{
                left: `${effect.x}%`,
                bottom: '50%',
                position: 'absolute',
              }}
            >
              <div className="wrong-key-content">
                <span className="wrong-x">❌</span>
                <span className="wrong-key-letter">{effect.key}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Instructions */}
      {!gameOver && (
        <div className="instructions">
          <p>👆 Press the keys on your keyboard to pop the bubbles! 🎈</p>
        </div>
      )}
    </div>
  );
};

export default TypingGame;
