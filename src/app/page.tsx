"use client";

import { useEffect, useState } from "react";

type Grid = number[][];

export default function Home() {
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

    const selectedStyle = isSelected ? "border-4 border-blue-500" : "";
    const highlightStyle = isHighlighted ? "bg-blue-100" : "";

    return `bg-white ${color} ${selectedStyle} ${highlightStyle} ${borderStyles}`;
  };

  return (
    <main className="h-screen w-full bg-lime-400 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-6 text-white drop-shadow-lg text-center">
        Sudoku Grid
      </h1>

      <div className="grid grid-cols-9 gap-[2px] w-full max-w-3xl bg-black rounded-lg bg-black shadow-2xl p-2 shadow-lg">
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
                  onChange={(e) => handleChange(e.target.value, rowIndex, colIndex)}
                />
              )}
            </div>
          ))
        )}
      </div>

      <button
        onClick={resetWrongAnswers}
        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 active:scale-95 hover:scale-105 transition-transform duration-150"
      >
        Reset Wrong Answers
      </button>
    </main>
  );
}
