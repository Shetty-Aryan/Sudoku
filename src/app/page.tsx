"use client";

import { useEffect, useState } from "react";

type Grid = number[][];

export default function Home() {
  const [showHome, setShowHome] = useState(true);
  const [errorCount,setErrorCount]=useState(0);
  const [question, setQuestion] = useState<Grid>(
    Array.from({ length: 9 }, () => Array(9).fill(0))
  );
  const [solution, setSolution] = useState<Grid>(
    Array.from({ length: 9 }, () => Array(9).fill(0))
  );
  const [userGrid, setUserGrid] = useState<Grid>(
    Array.from({ length: 9 }, () => Array(9).fill(0))
  );
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  let errors=0;
  const parseStringToGrid = (str: string): number[][] => {
    const nums = str.split("").map((ch) => parseInt(ch, 10));
    const grid: number[][] = [];
    for (let i = 0; i < 9; i++) {
      grid.push(nums.slice(i * 9, (i + 1) * 9));
    }
    return grid;
  };

  useEffect(() => {
    const fetchGrid = async () => {
      try {
        const res = await fetch("/api/grid");
        if (!res.ok) throw new Error("Failed to fetch grid");
        const data = await res.json();

        const questionGrid = parseStringToGrid(data.question);
        const solutionGrid = parseStringToGrid(data.solution);
        setQuestion(questionGrid);
        setSolution(solutionGrid);
        setUserGrid(questionGrid);
      } catch (error) {
        console.error("Error fetching Sudoku grid:", error);
      }
    };

    fetchGrid();
  }, []);

  const handleChange = (value: string, row: number, col: number) => {
    if (question[row][col] !== 0) return;

    const newGrid = userGrid.map((r) => [...r]);

    if (value === "") {
      newGrid[row][col] = 0;
      setUserGrid(newGrid);
      return;
    }

    const num = parseInt(value);
    if (!Number.isInteger(num) || num < 1 || num > 9) return;

    newGrid[row][col] = num;
    if (num !== solution[row][col]) {
    const newErrorCount = errorCount + 1;
    setErrorCount(newErrorCount);

    if (newErrorCount >= 5) {
      alert("You have made 5 errors! Redirecting to the home screen.");
      setErrorCount(0); // Reset error count
      setUserGrid(question); // Reset the grid
      // Redirect to the home screen logic
      window.location.reload(); // For simplicity, reload the page (update this if using routing)
    }
  }
    setUserGrid(newGrid);
  };

  const resetWrongAnswers = () => {
    const newGrid = userGrid.map((row, r) =>
      row.map((val, c) =>
        question[r][c] === 0 && val !== 0 && val !== solution[r][c] ? 0 : val
      )
    );
    setUserGrid(newGrid);
  };

  const getCellStyle = (row: number, col: number) => {
    const isSelected = selectedCell && selectedCell[0] === row && selectedCell[1] === col;
    const isHighlighted =
      selectedCell && (selectedCell[0] === row || selectedCell[1] === col);

    const borderStyles = `
      ${col % 3 === 2 ? "border-r-2 border-black" : ""}
      ${row % 3 === 2 ? "border-b-2 border-black" : ""}
    `;

    if (question[row][col] !== 0) {
      return `bg-gray-200 text-black font-bold ${borderStyles}`;
    }

    const isCorrect = userGrid[row][col] === solution[row][col];
    const hasInput = userGrid[row][col] !== 0;
    const color = hasInput ? (isCorrect ? "text-green-700" : "text-red-600") : "text-black";
    errors=hasInput?(isCorrect ?errors:errors+1 ):errors;

    const selectedStyle = isSelected ? "border-4 border-blue-500" : "";
    const highlightStyle = isHighlighted ? "bg-blue-100" : "";

    return `bg-white ${color} ${selectedStyle} ${highlightStyle} ${borderStyles}`;
  };

  return (
    <main className="h-screen w-full bg-gradient-to-r from-lime-400 via-blue-300 to-purple-500 flex flex-col items-center justify-center p-4">
  {showHome ? (
    <div className="flex flex-col items-center">
      <h1 className="text-5xl font-bold mb-6 text-black drop-shadow-lg">
        Welcome to Sudoku
      </h1>
      <button
        onClick={() => setShowHome(false)}
        className="px-8 py-4 bg-blue-600 text-white text-2xl rounded-lg shadow-lg hover:bg-blue-700 active:scale-95 hover:scale-105 hover:text-yellow-300 transition-transform duration-150"
      >
        Start Game
      </button>
    </div>
  ) : (
    <>
      <h1 className="text-4xl font-bold mb-6 text-black drop-shadow-lg text-center">
        Sudoku Grid
      </h1>
      <div className="grid grid-cols-9 gap-[2px] w-full max-w-3xl bg-black rounded-lg shadow-2xl p-2">
        {userGrid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`w-full aspect-square text-2xl flex items-center justify-center rounded-md transition-all duration-200 hover:scale-110 ${getCellStyle(
                rowIndex,
                colIndex
              )}`}
              onClick={() => setSelectedCell([rowIndex, colIndex])}
            >
              {question[rowIndex][colIndex] !== 0 ? (
                question[rowIndex][colIndex]
              ) : (
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="w-full h-full text-center outline-none bg-transparent focus:ring-2 focus:ring-blue-500"
                  value={userGrid[rowIndex][colIndex] || ""}
                  onChange={(e) =>
                    handleChange(e.target.value, rowIndex, colIndex)
                  }
                />
              )}
            </div>
          ))
        )}
      </div>

      {/* Error Counter and Reset Button */}
      <div className="flex items-center justify-between gap-6 mt-6 w-full max-w-3xl">
        <div className="text-lg text-red-600 font-semibold">
          Errors: {errorCount}/5
        </div>
        <button
          onClick={resetWrongAnswers}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 active:scale-95 hover:scale-105 transition-transform duration-150"
        >
          Reset Wrong Answers
        </button>
      </div>
    </>
  )}
</main>

  );
}
