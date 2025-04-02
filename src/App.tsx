import { useState, useEffect } from "react";
import { CiEraser } from "react-icons/ci";
import { GoPencil } from "react-icons/go";
interface Puzzle {
  Mat: number[][];
  B: number[][];
  C: number[];
  D: number[];
}

const N: number = 6;
const MaxSum: number = 5;

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
  const [hearts, setHearts] = useState<number>(3);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [completedCells, setCompletedCells] = useState<number>(0); // Track completed actions

  const handleCellClick = (row: number, col: number): void => {
    if (gameOver || hearts <= 0 || playerB[row][col] !== -1) return; // Lock if already interacted

    const newPlayerB: number[][] = playerB.map((r) => [...r]);
    const isCorrect = puzzle.B[row][col] === (tool === "pen" ? 1 : 0);

    if (tool === "pen") {
      if (isCorrect) {
        newPlayerB[row][col] = 1; // Circle the number
        setCompletedCells(completedCells + 1);
      } else {
        setHearts(hearts - 1);
        newPlayerB[row][col] = -1; // Reset to neutral if wrong
      }
    } else if (tool === "eraser") {
      if (isCorrect) {
        newPlayerB[row][col] = 0; // Erase the number
        setCompletedCells(completedCells + 1);
      } else {
        setHearts(hearts - 1);
        newPlayerB[row][col] = -1; // Reset to neutral if wrong
      }
    }

    setPlayerB(newPlayerB);

    if (hearts - (isCorrect ? 0 : 1) <= 0) {
      setGameOver(true);
      alert("Game Over! You ran out of hearts.");
    }
  };

  useEffect(() => {
    // Check if all cells are completed (N * N actions)
    if (completedCells === N * N) {
      const isCorrect = playerB.every((row, i) =>
        row.every((val, j) => val === puzzle.B[i][j])
      );
      setGameOver(true);
      if (isCorrect) {
        alert("Congratulations! You solved the puzzle!");
      } else {
        alert("Sorry, you didn’t solve it correctly.");
      }
    }
  }, [completedCells, playerB, puzzle.B]);

  const resetGame = (): void => {
    setPuzzle(generatePuzzle());
    setPlayerB(
      Array(N)
        .fill(null)
        .map(() => Array(N).fill(-1))
    );
    setGameOver(false);
    setHearts(3);
    setTool("pen");
    setCompletedCells(0);
  };

  const toggleTool = (): void => {
    setTool(tool === "pen" ? "eraser" : "pen");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 select-none">
      <h1 className="text-3xl font-bold mb-4 animate-fade-in">
        Sum Puzzle Game
      </h1>

      <div className="mb-4 flex items-center space-x-4 animate-fade-in">
        <span className="font-bold text-lg">
          Hearts: {Array(hearts).fill("❤️").join("")}
        </span>
        <div
          onClick={toggleTool}
          className="relative w-16 h-8 bg-gray-300 rounded-full cursor-pointer flex items-center p-1 transition-all duration-300"
        >
          <div
            className={`w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center transition-transform duration-300 ${
              tool === "pen" ? "translate-x-0" : "translate-x-8"
            }`}
          >
            {tool === "pen" ? <GoPencil /> : <CiEraser />}
          </div>
        </div>
      </div>

      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${N + 1}, minmax(0, 1fr))` }}
      >
        <div className="w-10 h-10 flex items-center justify-center font-bold">
          
        </div>
        {puzzle.D.map((sum, j) => (
          <div
            key={j}
            className="w-10 h-10 flex items-center justify-center font-bold bg-rose-200 rounded-sm"
          >
            {sum}
          </div>
        ))}

        {puzzle.Mat.map((row, i) => (
          <>
            <div className="w-10 h-10 flex items-center justify-center font-bold bg-rose-200 rounded-sm">
              {puzzle.C[i]}
            </div>
            {row.map((val, j) => (
              <div
                key={`${i}-${j}`}
                onClick={() => handleCellClick(i, j)}
                className={`w-10 h-10 flex items-center justify-center border border-gray-400 cursor-pointer transition-all duration-200 ${
                  playerB[i][j] === 1
                    ? "bg-violet-200 rounded-full scale-105"
                    : playerB[i][j] === 0
                    ? "bg-white rounded-sm opacity-50"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                {playerB[i][j] === 0 ? "" : val}
              </div>
            ))}
          </>
        ))}
      </div>

      <div className="mt-4 space-x-4 animate-fade-in">
        <button
          onClick={resetGame}
          className="px-4 py-2 border rounded hover:bg-black hover:text-white transition-colors duration-200"
        >
          New Game
        </button>
      </div>
    </div>
  );
};

export default App;
