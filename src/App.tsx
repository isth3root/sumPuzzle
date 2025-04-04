import { useState, useEffect } from "react";
import { CiEraser } from "react-icons/ci";
import { GoPencil } from "react-icons/go";
import { BsSun, BsMoon } from "react-icons/bs";

interface Puzzle {
  Mat: number[][];
  B: number[][];
  C: number[];
  D: number[];
}

const N: number = 6;
const MaxSum: number = 5;
const TOTAL_HEARTS: number = 3;

const generatePuzzle = (): Puzzle => {
  let Mat: number[][] = [];
  let B: number[][] = [];
  let MatB: number[][] = [];
  let SumN_Row: number[] = [];
  let SumN_Col: number[] = [];

  let valid: boolean = false;
  while (!valid) {
    Mat = Array(N)
      .fill(null)
      .map(() =>
        Array(N)
          .fill(null)
          .map(() => Math.floor(Math.random() * 9) + 1)
      );
    B = Array(N)
      .fill(null)
      .map(() =>
        Array(N)
          .fill(null)
          .map(() => Math.round(Math.random()))
      );
    MatB = Mat.map((row, i) => row.map((val, j) => val * B[i][j]));
    SumN_Row = MatB.map((row) => row.reduce((a, b) => a + b, 0));
    SumN_Col = MatB[0].map((_, j) =>
      MatB.reduce((sum, row) => sum + row[j], 0)
    );
    valid =
      SumN_Row.every((sum) => sum > 0) &&
      SumN_Col.every((sum) => sum > 0) &&
      (SumN_Row.some((sum) => sum <= MaxSum) ||
        SumN_Col.some((sum) => sum <= MaxSum));
  }
  return { Mat, B, C: SumN_Row, D: SumN_Col };
};

const App: React.FC = () => {
  const [puzzle, setPuzzle] = useState<Puzzle>(generatePuzzle());
  const [playerB, setPlayerB] = useState<number[][]>(
    Array(N)
      .fill(null)
      .map(() => Array(N).fill(-1))
  );
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [hearts, setHearts] = useState<number>(TOTAL_HEARTS);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [completedCells, setCompletedCells] = useState<number>(0);
  const [time, setTime] = useState<number>(0);
  const [wrongCells, setWrongCells] = useState<Set<string>>(new Set());
  const [blinkingCells, setBlinkingCells] = useState<Set<string>>(new Set());
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    if (!gameOver && hearts > 0) {
      const timer = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameOver, hearts]);

  const handleCellClick = (row: number, col: number): void => {
    if (gameOver || hearts <= 0 || playerB[row][col] !== -1) return;

    const newPlayerB: number[][] = playerB.map((r) => [...r]);
    const isCorrect = puzzle.B[row][col] === (tool === "pen" ? 1 : 0);

    if (isCorrect) {
      newPlayerB[row][col] = tool === "pen" ? 1 : 0;
      setCompletedCells(completedCells + 1);

      const rowCompleted = newPlayerB[row].every(
        (val, j) => val === puzzle.B[row][j]
      );
      const colCompleted = newPlayerB.every(
        (r, i) => r[col] === puzzle.B[i][col]
      );

      if (rowCompleted || colCompleted) {
        triggerBlinkAnimation(row, col, rowCompleted, colCompleted);
      }
    } else {
      setHearts(hearts - 1);
      newPlayerB[row][col] = -1;
      const cellKey = `${row}-${col}`;
      setWrongCells((prev) => new Set(prev).add(cellKey));
      setTimeout(() => {
        setWrongCells((prev) => {
          const newSet = new Set(prev);
          newSet.delete(cellKey);
          return newSet;
        });
      }, 300);
    }

    setPlayerB(newPlayerB);

    if (hearts - (isCorrect ? 0 : 1) <= 0) {
      setGameOver(true);
      alert("Game Over! You ran out of hearts.");
    }
  };

  const triggerBlinkAnimation = (
    row: number,
    col: number,
    rowCompleted: boolean,
    colCompleted: boolean
  ): void => {
    const delay = 50;
    const blinkDuration = 100;

    if (rowCompleted) {
      for (let j = 0; j < N; j++) {
        const cellKey = `${row}-${j}`;
        setTimeout(() => {
          setBlinkingCells((prev) => new Set(prev).add(cellKey));
          setTimeout(() => {
            setBlinkingCells((prev) => {
              const newSet = new Set(prev);
              newSet.delete(cellKey);
              return newSet;
            });
          }, blinkDuration);
        }, j * delay);
      }
    }

    if (colCompleted) {
      for (let i = 0; i < N; i++) {
        const cellKey = `${i}-${col}`;
        setTimeout(() => {
          setBlinkingCells((prev) => new Set(prev).add(cellKey));
          setTimeout(() => {
            setBlinkingCells((prev) => {
              const newSet = new Set(prev);
              newSet.delete(cellKey);
              return newSet;
            });
          }, blinkDuration);
        }, i * delay);
      }
    }
  };

  useEffect(() => {
    if (completedCells === N * N) {
      const isCorrect = playerB.every((row, i) =>
        row.every((val, j) => val === puzzle.B[i][j])
      );
      setGameOver(true);
      if (isCorrect) {
        alert(`Congratulations! You solved the puzzle in ${time} seconds!`);
      } else {
        alert("Sorry, you didn’t solve it correctly.");
      }
    }
  }, [completedCells, playerB, puzzle.B, time]);

  const resetGame = (): void => {
    setPuzzle(generatePuzzle());
    setPlayerB(
      Array(N)
        .fill(null)
        .map(() => Array(N).fill(-1))
    );
    setGameOver(false);
    setHearts(TOTAL_HEARTS);
    setTool("pen");
    setCompletedCells(0);
    setTime(0);
    setWrongCells(new Set());
    setBlinkingCells(new Set());
  };

  const toggleTool = (): void => {
    setTool(tool === "pen" ? "eraser" : "pen");
  };

  const toggleTheme = (): void => {
    setIsDarkMode((prev) => !prev);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const renderHearts = (): string => {
    const activeHearts = Array(hearts).fill("❤️").join("");
    const lostHearts = Array(TOTAL_HEARTS - hearts).fill("🩶").join("");
    return activeHearts + lostHearts;
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-4 select-none ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      {/* Theme toggle in top-right */}
      <div className="w-full flex justify-end mb-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full absolute right-4 top-4 bg-gray-300 dark:bg-gray-700 text-black dark:text-white hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors duration-200"
        >
          {isDarkMode ? <BsSun size={20} /> : <BsMoon size={20} />}
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-4 animate-fade-in">
        Sum Puzzle Game
      </h1>

      <div className="mb-4 flex items-center space-x-4 animate-fade-in">
        <span className="font-bold text-lg">Hearts: {renderHearts()}</span>
        <span className="font-bold text-lg">Time: {formatTime(time)}</span>
      </div>

      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${N + 1}, 2.5rem)` }} // Fixed width for tight spacing
      >
        <div className="w-10 h-10 flex items-center justify-center font-bold"></div>
        {puzzle.D.map((sum, j) => (
          <div
            key={j}
            className={`w-10 h-10 flex items-center justify-center font-bold rounded-sm ${
              isDarkMode ? "bg-rose-400 text-white" : "bg-rose-200 text-black"
            }`}
          >
            {sum}
          </div>
        ))}

        {puzzle.Mat.map((row, i) => (
          <>
            <div
              className={`w-10 h-10 flex items-center justify-center font-bold rounded-sm ${
                isDarkMode ? "bg-rose-400 text-white" : "bg-rose-200 text-black"
              }`}
            >
              {puzzle.C[i]}
            </div>
            {row.map((val, j) => {
              const cellKey = `${i}-${j}`;
              const isWrong = wrongCells.has(cellKey);
              const isBlinking = blinkingCells.has(cellKey);
              return (
                <div
                  key={cellKey}
                  onClick={() => handleCellClick(i, j)}
                  className={`w-10 h-10 flex items-center justify-center border border-gray-400 cursor-pointer transition-all duration-200 ${
                    isWrong
                      ? "bg-red-500 text-white"
                      : isBlinking
                      ? "animate-blink"
                      : playerB[i][j] === 1
                      ? ` rounded-full scale-105 ${
                          isDarkMode ? "bg-violet-400" : "bg-violet-200"
                        }`
                      : playerB[i][j] === 0
                      ? isDarkMode
                        ? "bg-gray-800 rounded-sm opacity-50"
                        : "bg-white rounded-sm opacity-50"
                      : isDarkMode
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  {playerB[i][j] === 0 ? "" : val}
                </div>
              );
            })}
          </>
        ))}
      </div>

      <div className="mt-4 flex justify-center animate-fade-in">
        <div
          onClick={toggleTool}
          className={`relative w-24 h-12 rounded-full cursor-pointer flex items-center p-2 transition-all duration-300 ${
            isDarkMode ? "bg-gray-700" : "bg-gray-300"
          }`}
        >
          <div
            className={`w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center transition-transform duration-300 ${
              tool === "pen" ? "translate-x-0" : "translate-x-12"
            }`}
          >
            {tool === "pen" ? (
              <GoPencil
                size={24}
                className={` ${isDarkMode ? "text-black" : ""}`}
              />
            ) : (
              <CiEraser
                size={24}
                className={` ${isDarkMode ? "text-black" : ""}`}
              />
            )}
          </div>
        </div>
      </div>

      {gameOver && (
        <div className="mt-4 flex justify-center animate-fade-in">
          <button
            onClick={resetGame}
            className={`px-4 py-2 border rounded transition-colors duration-200 ${
              isDarkMode
                ? "border-white text-white hover:bg-gray-700"
                : "border-black text-black hover:bg-black hover:text-white"
            }`}
          >
            New Game
          </button>
        </div>
      )}
    </div>
  );
};

export default App;