import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, Code, Terminal as TermIcon, RotateCcw, AlertTriangle, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

// =====================================================
// MAXX FORGE STUDIO™ — Aries Python Arcade Console
// Side-by-side source code viewer & interactive CRT terminal emulator
// =====================================================

const PYTHON_GAMES = {
  'snake_game.py': {
    name: 'snake_game.py',
    description: 'Grid-based retro snake action running directly in the terminal.',
    difficulty: 'Medium',
    category: 'Arcade',
    code: `import random
import time
import os

# --- Maxx Forge Python Game Engine ---
GRID_WIDTH = 15
GRID_HEIGHT = 10

snake = [(5, 5), (4, 5), (3, 5)]
direction = "RIGHT"
food = (10, 5)
score = 0
game_over = False

def place_food():
    while True:
        pos = (random.randint(0, GRID_WIDTH-1), random.randint(0, GRID_HEIGHT-1))
        if pos not in snake:
            return pos

def render_frame():
    os.system("clear")
    print(f"=== ARIES PYTHON SNAKE ===")
    print(f"Score: {score} | Controls: WASD/Arrows")
    print("+" + "-" * GRID_WIDTH + "+")
    
    for y in range(GRID_HEIGHT):
        line = "|"
        for x in range(GRID_WIDTH):
            if (x, y) == snake[0]:
                line += "O" # Head
            elif (x, y) in snake[1:]:
                line += "o" # Body
            elif (x, y) == food:
                line += "X" # Food
            else:
                line += " " # Empty
        line += "|"
        print(line)
        
    print("+" + "-" * GRID_WIDTH + "+")
    print("Press RUN + Controls to play!")
`,
  },
  'guess_number.py': {
    name: 'guess_number.py',
    description: 'Hot/Cold number guessing game with Aries AI feedback.',
    difficulty: 'Easy',
    category: 'Logic',
    code: `import random

print("=== ARIES AI GUESSING ENGINE ===")
print("I have selected a secret signature code between 1 and 100.")
print("Type a guess and press ENTER to analyze signal telemetry.")

secret = random.randint(1, 100)
attempts = 0

while True:
    try:
        guess = int(input("Enter guess: "))
        attempts += 1
        
        if guess == secret:
            print(f"\\n[SUCCESS] Signal matched in {attempts} attempt(s)!")
            print("Telemetric lock confirmed. Database verified.")
            break
        elif guess < secret:
            print("[SIGNAL] Telemetry too LOW. Increase transmission frequency.")
        else:
            print("[SIGNAL] Telemetry too HIGH. Decrease transmission frequency.")
    except ValueError:
        print("[ERROR] Invalid numeric frequency. Try again.")
`,
  },
  'forge_adventure.py': {
    name: 'forge_adventure.py',
    description: 'A text-based RPG exploring the rooms of Maxx Forge Studio.',
    difficulty: 'Easy',
    category: 'RPG',
    code: `print("=== FORGE ADVENTURE ===")
print("You stand in the Central Matrix lobby of Maxx Forge Studio.")
print("Verified rooms nearby: [records], [events], [gamedev], [vault]")

inventory = []
location = "lobby"

while True:
    print(f"\\nLocation: {location} | Inventory: {inventory}")
    cmd = input("Where to next? ").lower().strip()
    
    if cmd == "help":
        print("Commands: records, events, gamedev, vault, search, exit")
    elif cmd == "records":
        location = "Prime Records Vault"
        print("Vinyl matrices surround you. Synthesizers hum low.")
    elif cmd == "events":
        location = "Stage Production Rig"
        print("Laser emitters and TouchDesigner canvases blink green.")
    elif cmd == "gamedev":
        location = "Unity Horror Sandbox"
        print("Concrete grid nodes glow cyan. Cyber-Skull looms.")
    elif cmd == "vault":
        location = "Aries Core Crypt"
        if "emblem" in inventory:
            print("The crypt matches your Forge Emblem! You are verified.")
        else:
            print("Access Denied. You need the [emblem] collectible.")
    elif cmd == "search":
        if location == "Prime Records Vault" and "vinyl" not in inventory:
            inventory.append("vinyl")
            print("You found a legendary [vinyl] record!")
        elif location == "Unity Horror Sandbox" and "emblem" not in inventory:
            inventory.append("emblem")
            print("You found the golden [emblem] collectible!")
        else:
            print("Nothing found here.")
    elif cmd == "exit":
        print("Terminating Adventure. System back to idle.")
        break
    else:
        print("Error: Unknown destination. Type help.")
`
  }
};

export default function AriesPyArcade() {
  const [selectedFile, setSelectedFile] = useState('snake_game.py');
  const [isRunning, setIsRunning] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [inputText, setInputText] = useState('');
  
  // Game states for Snake
  const [snake, setSnake] = useState([(5, 5), (4, 5), (3, 5)]);
  const [food, setFood] = useState({ x: 10, y: 4 });
  const [direction, setDirection] = useState('RIGHT');
  const [score, setScore] = useState(0);
  const [snakeGameOver, setSnakeGameOver] = useState(false);
  
  // States for Guessing Game & RPG
  const [secretNumber, setSecretNumber] = useState(42);
  const [attempts, setAttempts] = useState(0);
  const [rpgInventory, setRpgInventory] = useState([]);
  const [rpgLocation, setRpgLocation] = useState('lobby');

  const consoleEndRef = useRef(null);

  // Auto-scroll terminal
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs]);

  // Game Loop for Snake
  useEffect(() => {
    if (selectedFile !== 'snake_game.py' || !isRunning || snakeGameOver) return;

    const runSnakeTick = () => {
      setSnake(prevSnake => {
        const head = { ...prevSnake[0] };
        
        switch (direction) {
          case 'UP': head.y -= 1; break;
          case 'DOWN': head.y += 1; break;
          case 'LEFT': head.x -= 1; break;
          case 'RIGHT': head.x += 1; break;
          default: break;
        }

        // Collision Checks
        if (head.x < 0 || head.x >= 15 || head.y < 0 || head.y >= 10) {
          setSnakeGameOver(true);
          setTerminalLogs(logs => [
            ...logs,
            { text: `[CRITICAL] COLLISION DETECTED AT (${head.x}, ${head.y})`, type: 'error' },
            { text: `GAME OVER! Score: ${score}`, type: 'system' },
            { text: `Click STOP to exit terminal execution loop.`, type: 'info' }
          ]);
          return prevSnake;
        }

        // Snake self collision
        if (prevSnake.some((segment, index) => index > 0 && segment.x === head.x && segment.y === head.y)) {
          setSnakeGameOver(true);
          setTerminalLogs(logs => [
            ...logs,
            { text: `[CRITICAL] SELF-COLLISION DETECTED`, type: 'error' },
            { text: `GAME OVER! Score: ${score}`, type: 'system' }
          ]);
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Eat food check
        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + 10);
          setFood({
            x: Math.floor(Math.random() * 15),
            y: Math.floor(Math.random() * 10)
          });
          // Place food sound alert or visual confirmation
          setTerminalLogs(logs => [
            ...logs,
            { text: `[TELEMETRY] Food acquired. Score: ${score + 10} (+10)`, type: 'system' }
          ]);
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const timer = setInterval(runSnakeTick, 280);
    return () => clearInterval(timer);
  }, [isRunning, direction, food, selectedFile, snakeGameOver, score]);

  const handleRunScript = () => {
    setIsRunning(true);
    setTerminalLogs([
      { text: `guest@aries-engine:~$ python3 ${selectedFile}`, type: 'user' },
      { text: `>>> Loading Python environment, version 3.11.4-Wasm`, type: 'system' },
      { text: `>>> Loading script assets for ${selectedFile}...`, type: 'system' }
    ]);

    if (selectedFile === 'snake_game.py') {
      setSnake([{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }]);
      setFood({ x: 10, y: 5 });
      setDirection('RIGHT');
      setScore(0);
      setSnakeGameOver(false);
      setTerminalLogs(prev => [
        ...prev,
        { text: `>>> Aries Python Game Screen Initialized successfully.`, type: 'success' },
        { text: `Score: 0 | Use WASD / Arrow keys to navigate`, type: 'system' }
      ]);
    } else if (selectedFile === 'guess_number.py') {
      const num = Math.floor(Math.random() * 100) + 1;
      setSecretNumber(num);
      setAttempts(0);
      setTerminalLogs(prev => [
        ...prev,
        { text: `=== ARIES AI GUESSING ENGINE ===`, type: 'success' },
        { text: `I have selected a secret signature code between 1 and 100.`, type: 'system' },
        { text: `Type a guess and press ENTER to analyze signal telemetry.`, type: 'system' },
        { text: `Enter guess: `, type: 'prompt' }
      ]);
    } else if (selectedFile === 'forge_adventure.py') {
      setRpgInventory([]);
      setRpgLocation('lobby');
      setTerminalLogs(prev => [
        ...prev,
        { text: `=== FORGE ADVENTURE ===`, type: 'success' },
        { text: `You stand in the Central Matrix lobby of Maxx Forge Studio.`, type: 'system' },
        { text: `Rooms nearby: [records], [events], [gamedev], [vault]. Type help.`, type: 'system' },
        { text: `Where to next? `, type: 'prompt' }
      ]);
    }
  };

  const handleStopScript = () => {
    setIsRunning(false);
    setTerminalLogs(prev => [
      ...prev,
      { text: `>>> Script terminated. Execution returned 0.`, type: 'error' }
    ]);
  };

  const handleCommandInput = (e) => {
    e.preventDefault();
    const cmd = inputText.trim();
    if (!cmd) return;

    setTerminalLogs(prev => [...prev, { text: cmd, type: 'user_input' }]);
    setInputText('');

    if (selectedFile === 'guess_number.py') {
      const guess = parseInt(cmd);
      if (isNaN(guess)) {
        setTerminalLogs(prev => [...prev, { text: `[ERROR] Invalid numeric frequency. Try again.`, type: 'error' }, { text: `Enter guess: `, type: 'prompt' }]);
        return;
      }
      
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (guess === secretNumber) {
        setTerminalLogs(prev => [
          ...prev,
          { text: `[SUCCESS] Signal matched in ${newAttempts} attempt(s)!`, type: 'success' },
          { text: `Telemetric lock confirmed. Database verified. Exiting...`, type: 'system' }
        ]);
        setIsRunning(false);
      } else if (guess < secretNumber) {
        setTerminalLogs(prev => [
          ...prev,
          { text: `[SIGNAL] Telemetry too LOW. Increase transmission frequency.`, type: 'info' },
          { text: `Enter guess: `, type: 'prompt' }
        ]);
      } else {
        setTerminalLogs(prev => [
          ...prev,
          { text: `[SIGNAL] Telemetry too HIGH. Decrease transmission frequency.`, type: 'info' },
          { text: `Enter guess: `, type: 'prompt' }
        ]);
      }
    } else if (selectedFile === 'forge_adventure.py') {
      const lowerCmd = cmd.toLowerCase().trim();
      
      if (lowerCmd === 'help') {
        setTerminalLogs(prev => [
          ...prev,
          { text: `Commands: records, events, gamedev, vault, search, exit`, type: 'system' },
          { text: `Where to next? `, type: 'prompt' }
        ]);
      } else if (lowerCmd === 'records') {
        setRpgLocation('Prime Records Vault');
        setTerminalLogs(prev => [
          ...prev,
          { text: `Vinyl matrices surround you. Synthesizers hum low.`, type: 'info' },
          { text: `Where to next? `, type: 'prompt' }
        ]);
      } else if (lowerCmd === 'events') {
        setRpgLocation('Stage Production Rig');
        setTerminalLogs(prev => [
          ...prev,
          { text: `Laser emitters and TouchDesigner canvases blink green.`, type: 'info' },
          { text: `Where to next? `, type: 'prompt' }
        ]);
      } else if (lowerCmd === 'gamedev') {
        setRpgLocation('Unity Horror Sandbox');
        setTerminalLogs(prev => [
          ...prev,
          { text: `Concrete grid nodes glow cyan. Cyber-Skull looms.`, type: 'info' },
          { text: `Where to next? `, type: 'prompt' }
        ]);
      } else if (lowerCmd === 'vault') {
        if (rpgInventory.includes('emblem')) {
          setRpgLocation('Aries Core Crypt');
          setTerminalLogs(prev => [
            ...prev,
            { text: `[SUCCESS] The crypt matches your Forge Emblem! You are verified.`, type: 'success' },
            { text: `Where to next? `, type: 'prompt' }
          ]);
        } else {
          setTerminalLogs(prev => [
            ...prev,
            { text: `Access Denied. You need the [emblem] collectible. Go to [gamedev] and [search].`, type: 'error' },
            { text: `Where to next? `, type: 'prompt' }
          ]);
        }
      } else if (lowerCmd === 'search') {
        if (rpgLocation === 'Prime Records Vault' && !rpgInventory.includes('vinyl')) {
          setRpgInventory([...rpgInventory, 'vinyl']);
          setTerminalLogs(prev => [
            ...prev,
            { text: `You found a legendary [vinyl] record!`, type: 'success' },
            { text: `Where to next? `, type: 'prompt' }
          ]);
        } else if (rpgLocation === 'Unity Horror Sandbox' && !rpgInventory.includes('emblem')) {
          setRpgInventory([...rpgInventory, 'emblem']);
          setTerminalLogs(prev => [
            ...prev,
            { text: `You found the golden [emblem] collectible!`, type: 'success' },
            { text: `Where to next? `, type: 'prompt' }
          ]);
        } else {
          setTerminalLogs(prev => [
            ...prev,
            { text: `Nothing found here.`, type: 'info' },
            { text: `Where to next? `, type: 'prompt' }
          ]);
        }
      } else if (lowerCmd === 'exit') {
        setTerminalLogs(prev => [...prev, { text: `Terminating Adventure. System back to idle.`, type: 'system' }]);
        setIsRunning(false);
      } else {
        setTerminalLogs(prev => [
          ...prev,
          { text: `Error: Unknown destination. Type help.`, type: 'error' },
          { text: `Where to next? `, type: 'prompt' }
        ]);
      }
    }
  };

  // Keyboard navigation for Snake
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isRunning || selectedFile !== 'snake_game.py') return;
      const key = e.key.toLowerCase();
      
      if ((key === 'w' || e.key === 'ArrowUp') && direction !== 'DOWN') setDirection('UP');
      if ((key === 's' || e.key === 'ArrowDown') && direction !== 'UP') setDirection('DOWN');
      if ((key === 'a' || e.key === 'ArrowLeft') && direction !== 'RIGHT') setDirection('LEFT');
      if ((key === 'd' || e.key === 'ArrowRight') && direction !== 'LEFT') setDirection('RIGHT');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, direction, selectedFile]);

  // Rendering Helper for Snake Grid
  const renderSnakeGrid = () => {
    const rows = [];
    for (let y = 0; y < 10; y++) {
      const row = [];
      for (let x = 0; x < 15; x++) {
        const isHead = snake[0] && snake[0].x === x && snake[0].y === y;
        const isBody = snake.slice(1).some(segment => segment.x === x && segment.y === y);
        const isFood = food.x === x && food.y === y;

        row.push(
          <div
            key={`${x}-${y}`}
            style={{
              width: '100%',
              height: '100%',
              background: isHead ? '#10B981' : isBody ? '#065F46' : isFood ? '#FF3333' : 'transparent',
              border: '1px solid rgba(255,255,255,0.03)',
              borderRadius: isHead || isFood ? '4px' : '0px',
              boxShadow: isHead ? '0 0 10px #10B981' : isFood ? '0 0 10px #FF3333' : 'none',
            }}
          />
        );
      }
      rows.push(row);
    }
    return rows;
  };

  const gameInfo = PYTHON_GAMES[selectedFile];

  return (
    <div style={styles.container}>
      {/* Tab bar / File Selector */}
      <div style={styles.tabBar}>
        <div style={styles.titleArea}>
          <span style={styles.redDot} />
          <span style={styles.consoleTitle}>ARIES PYTHON ARCADE</span>
        </div>
        <div style={styles.tabsRow}>
          {Object.keys(PYTHON_GAMES).map(file => (
            <button
              key={file}
              onClick={() => { setSelectedFile(file); setIsRunning(false); }}
              style={{
                ...styles.tabButton,
                ...(selectedFile === file ? styles.tabButtonActive : {})
              }}
            >
              <Code size={12} />
              {file}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.mainGrid}>
        {/* Code view side */}
        <div style={styles.codeColumn}>
          <div style={styles.columnHeader}>
            <span style={styles.headerLabel}>SOURCE CODE (PYTHON 3)</span>
            <span style={styles.difficultyTag}>{gameInfo.difficulty}</span>
          </div>
          <pre style={styles.codePre}>
            <code>{gameInfo.code}</code>
          </pre>
        </div>

        {/* Terminal console side */}
        <div style={styles.terminalColumn}>
          <div style={styles.columnHeader}>
            <span style={styles.headerLabel}>CRT MONITOR PORT</span>
            <div style={styles.controlsRow}>
              {isRunning ? (
                <button onClick={handleStopScript} style={styles.stopButton}>
                  <Square size={10} fill="#FF5555" color="#FF5555" /> STOP
                </button>
              ) : (
                <button onClick={handleRunScript} style={styles.runButton}>
                  <Play size={10} fill="#10B981" color="#10B981" /> RUN PYTHON
                </button>
              )}
            </div>
          </div>

          <div style={styles.terminalScreen}>
            {/* CRT Scanline overlay */}
            <div style={styles.scanlineOverlay} />

            {/* Snake Interactive Display */}
            {selectedFile === 'snake_game.py' && isRunning && !snakeGameOver ? (
              <div style={styles.snakeFrame}>
                <div style={styles.snakeHeader}>
                  <span>SCORE: {score}</span>
                  <span style={styles.liveIndicator}>● LIVE</span>
                </div>
                <div style={styles.gridDisplay}>
                  {renderSnakeGrid()}
                </div>
                {/* Virtual directional controls */}
                <div style={styles.virtualKeys}>
                  <button onClick={() => direction !== 'DOWN' && setDirection('UP')} style={styles.vKey}><ArrowUp size={14} /></button>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => direction !== 'RIGHT' && setDirection('LEFT')} style={styles.vKey}><ArrowLeft size={14} /></button>
                    <button onClick={() => direction !== 'UP' && setDirection('DOWN')} style={styles.vKey}><ArrowDown size={14} /></button>
                    <button onClick={() => direction !== 'LEFT' && setDirection('RIGHT')} style={styles.vKey}><ArrowRight size={14} /></button>
                  </div>
                </div>
              </div>
            ) : (
              /* Text terminal logging */
              <div style={styles.logsArea}>
                {terminalLogs.map((log, index) => (
                  <div key={index} style={{
                    ...styles.logLine,
                    color: log.type === 'user' ? '#00E5FF' : 
                           log.type === 'success' ? '#10B981' : 
                           log.type === 'error' ? '#FF5555' : 
                           log.type === 'prompt' ? '#FFD700' : '#85ff85'
                  }}>
                    {log.text}
                  </div>
                ))}
                
                {/* Input Prompt */}
                {isRunning && selectedFile !== 'snake_game.py' && (
                  <form onSubmit={handleCommandInput} style={styles.inputForm}>
                    <span style={styles.promptSign}>&gt;</span>
                    <input
                      type="text"
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      style={styles.terminalInput}
                      autoFocus
                    />
                  </form>
                )}
                <div ref={consoleEndRef} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: 'rgba(10, 10, 15, 0.9)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
    display: 'flex',
    flexDirection: 'column',
  },
  tabBar: {
    background: 'rgba(5, 5, 8, 0.95)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    padding: '10px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px',
    flexWrap: 'wrap'
  },
  titleArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  redDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#10B981',
    boxShadow: '0 0 8px #10B981'
  },
  consoleTitle: {
    fontFamily: 'monospace',
    fontSize: '11px',
    fontWeight: '800',
    color: '#e0e0e0',
    letterSpacing: '0.1em'
  },
  tabsRow: {
    display: 'flex',
    gap: '6px'
  },
  tabButton: {
    padding: '6px 12px',
    borderRadius: '8px',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.05)',
    color: 'rgba(255,255,255,0.4)',
    fontSize: '10px',
    fontFamily: 'monospace',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s'
  },
  tabButtonActive: {
    background: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    color: '#10B981'
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    minHeight: '440px',
  },
  codeColumn: {
    borderRight: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  columnHeader: {
    background: 'rgba(255,255,255,0.02)',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    padding: '8px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerLabel: {
    fontFamily: 'monospace',
    fontSize: '9px',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: '0.05em'
  },
  difficultyTag: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '4px',
    padding: '2px 6px',
    fontSize: '8px',
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'monospace'
  },
  codePre: {
    margin: 0,
    padding: '16px',
    background: '#050508',
    color: '#10B981',
    fontFamily: 'monospace',
    fontSize: '11px',
    lineHeight: 1.5,
    overflowX: 'auto',
    flex: 1,
    maxHeight: '380px'
  },
  terminalColumn: {
    display: 'flex',
    flexDirection: 'column',
    background: '#040406',
  },
  controlsRow: {
    display: 'flex',
    gap: '6px'
  },
  runButton: {
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    color: '#10B981',
    borderRadius: '6px',
    padding: '4px 10px',
    fontSize: '9px',
    fontFamily: 'monospace',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  stopButton: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#EF4444',
    borderRadius: '6px',
    padding: '4px 10px',
    fontSize: '9px',
    fontFamily: 'monospace',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  terminalScreen: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column'
  },
  scanlineOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
    pointerEvents: 'none',
    zIndex: 10
  },
  logsArea: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: '11px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    overflowY: 'auto',
    maxHeight: '380px'
  },
  logLine: {
    lineHeight: 1.4,
    whiteSpace: 'pre-wrap'
  },
  inputForm: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  promptSign: {
    color: '#FFD700',
    fontWeight: '700'
  },
  terminalInput: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#00E5FF',
    fontFamily: 'monospace',
    fontSize: '11px',
    flex: 1
  },
  snakeFrame: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px'
  },
  snakeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '220px',
    fontSize: '10px',
    color: '#85ff85',
    fontFamily: 'monospace'
  },
  liveIndicator: {
    color: '#10B981',
    animation: 'pulse 1s infinite alternate'
  },
  gridDisplay: {
    display: 'grid',
    gridTemplateColumns: 'repeat(15, 12px)',
    gridTemplateRows: 'repeat(10, 12px)',
    gap: '1px',
    background: '#09090b',
    border: '2px solid rgba(16, 185, 129, 0.2)',
    padding: '4px',
    borderRadius: '8px'
  },
  virtualKeys: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    marginTop: '6px'
  },
  vKey: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.6)',
    width: '32px',
    height: '24px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  }
};
