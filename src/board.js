import React, { useState, useCallback, useEffect } from 'react';

const styles = {
  board: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  boardRow: {
    display: 'flex',
  },
  square: {
    width: '60px',
    height: '60px',
    backgroundColor: '#fff',
    border: '1px solid #999',
    fontSize: '24px',
    fontWeight: 'bold',
    lineHeight: '60px',
    margin: '-1px -1px 0 0',
    padding: '0',
    textAlign: 'center',
  },
  status: {
    marginBottom: '10px',
    fontSize: '18px',
  },
  button: {
    margin: '5px',
    padding: '10px 15px',
    fontSize: '16px',
    cursor: 'pointer',
  },
};

function Board() {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [gameMode, setGameMode] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [showDifficultySelection, setShowDifficultySelection] = useState(false);

  const resetGame = useCallback(() => {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setGameOver(false);
  }, []);

  const makeAIMove = useCallback(() => {
    if (calculateWinner(squares) || squares.every(Boolean)) return;

    const aiMove = getAIMove(squares, difficulty);
    const newSquares = squares.slice();
    newSquares[aiMove] = 'O';
    setSquares(newSquares);
    setXIsNext(true);
  }, [squares, difficulty]);

  const handleClick = useCallback((i) => {
    if (calculateWinner(squares) || squares[i] || gameOver) return;
    const newSquares = squares.slice();
    newSquares[i] = xIsNext ? 'X' : 'O';
    setSquares(newSquares);
    setXIsNext(!xIsNext);
  }, [squares, xIsNext, gameOver]);

  useEffect(() => {
    if (gameMode === 'single' && !xIsNext && !gameOver) {
      const timer = setTimeout(() => {
        makeAIMove();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gameMode, xIsNext, gameOver, makeAIMove]);

  const handleContinue = useCallback((continuePlay) => {
    if (continuePlay) {
      // Reset to game mode selection
      setGameMode(null);
      setDifficulty(null);
      setShowDifficultySelection(false);
    } else {
      setGameOver(true);
      setGameMode(null);
      setDifficulty(null);
      setShowDifficultySelection(false);
    }
    resetGame();
  }, [resetGame]);

  const startGame = useCallback((isSinglePlayer) => {
    setGameMode(isSinglePlayer ? 'single' : 'multi');
    if (isSinglePlayer) {
      setShowDifficultySelection(true);
    } else {
      setDifficulty(null);
      resetGame();
    }
  }, [resetGame]);

  const selectDifficulty = useCallback((difficultyLevel) => {
    setDifficulty(difficultyLevel);
    setShowDifficultySelection(false);
    resetGame();
  }, [resetGame]);

  const winner = calculateWinner(squares);

  // Render function
  return (
    <div style={styles.board}>
      {gameMode === null ? (
        <div>
          <h2>Choose Game Mode</h2>
          <button style={styles.button} onClick={() => startGame(true)}>Single Player</button>
          <button style={styles.button} onClick={() => startGame(false)}>Multi Player</button>
        </div>
      ) : gameMode === 'single' && showDifficultySelection ? (
        <div>
          <h2>Choose Difficulty</h2>
          <button style={styles.button} onClick={() => selectDifficulty('easy')}>Easy</button>
          <button style={styles.button} onClick={() => selectDifficulty('medium')}>Medium</button>
          <button style={styles.button} onClick={() => selectDifficulty('hard')}>Hard</button>
        </div>
      ) : (
        <>
          <div style={styles.status}>
            {winner
              ? `Winner: ${winner}`
              : squares.every(Boolean)
              ? "It's a draw!"
              : `Next player: ${xIsNext ? 'X' : 'O'}`}
          </div>
          <div>
            {[0, 1, 2].map((row) => (
              <div key={row} style={styles.boardRow}>
                {[0, 1, 2].map((col) => {
                  const index = row * 3 + col;
                  return (
                    <button
                      key={index}
                      style={styles.square}
                      onClick={() => handleClick(index)}
                    >
                      {squares[index]}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          {(winner || squares.every(Boolean)) && (
            <div>
              <p>Game Over! Do you want to play again?</p>
              <button style={styles.button} onClick={() => handleContinue(true)}>
                Yes
              </button>
              <button style={styles.button} onClick={() => handleContinue(false)}>
                No
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function getAIMove(board, difficulty) {
  switch (difficulty) {
    case 'easy':
      return getRandomMove(board);
    case 'medium':
      return Math.random() < 0.5 ? findBestMove(board) : getRandomMove(board);
    case 'hard':
      return findBestMove(board);
    default:
      return getRandomMove(board);
  }
}

function getRandomMove(board) {
  const emptySquares = board.reduce((acc, val, idx) => 
    val === null ? acc.concat(idx) : acc, []);
  return emptySquares[Math.floor(Math.random() * emptySquares.length)];
}

function findBestMove(board) {
  let bestScore = -Infinity;
  let bestMove;
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = 'O';
      let score = minimax(board, 0, false);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }
  return bestMove;
}

function minimax(board, depth, isMaximizing) {
  const result = calculateWinner(board);
  if (result !== null) {
    return result === 'O' ? 10 - depth : depth - 10;
  }

  if (board.every(Boolean)) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'O';
        let score = minimax(board, depth + 1, false);
        board[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'X';
        let score = minimax(board, depth + 1, true);
        board[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

export default Board;