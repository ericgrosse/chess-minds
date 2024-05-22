import React, { useState, useRef } from 'react';
import './App.scss';

function App() {
  const rows = [8, 7, 6, 5, 4, 3, 2, 1];
  const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  const initialOverlayState = rows.reduce((acc, row) => {
    columns.forEach(col => {
      acc[`${col}${row}`] = false;
    });
    return acc;
  }, {});

  const [overlay, setOverlay] = useState(initialOverlayState);
  const [lines, setLines] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [currentLine, setCurrentLine] = useState(null);
  const boardRef = useRef(null);

  const handleRightClick = (e) => {
    e.preventDefault(); // Prevents the default context menu from appearing
  };

  const handleLeftClick = () => {
    setOverlay(initialOverlayState);
    setLines([]);
    setCurrentLine(null);
  };

  const handleMouseDown = (e, square) => {
    if (e.button === 2) { // Right mouse button
      e.preventDefault();
      setDragging(true);
      setCurrentLine({ start: square, end: square });
      setOverlay(prevOverlay => ({
        ...prevOverlay,
        [square]: !prevOverlay[square]
      }));
    }
  };

  const handleMouseUp = (e) => {
    if (e.button === 2 && dragging) {
      setDragging(false);
      if (currentLine && currentLine.start !== currentLine.end) {
        setLines([...lines, currentLine]);
      }
      setCurrentLine(null);
    }
  };

  const handleMouseMove = (e) => {
    if (dragging && boardRef.current) {
      const boardRect = boardRef.current.getBoundingClientRect();
      const x = e.clientX - boardRect.left;
      const y = e.clientY - boardRect.top;
      if (x >= 0 && x <= boardRect.width && y >= 0 && y <= boardRect.height) {
        const col = columns[Math.floor(x / (boardRect.width / 8))];
        const row = rows[Math.floor(y / (boardRect.height / 8))];
        const endSquare = `${col}${row}`;
        if (currentLine) {
          setCurrentLine({ ...currentLine, end: endSquare });
        }
      }
    }
  };

  const getSquareCenter = (square) => {
    const col = columns.indexOf(square[0]);
    const row = 8 - parseInt(square[1]);
    return {
      x: col * 50 + 25,
      y: row * 50 + 25
    };
  };

  return (
    <div className="App">
      <div
        className="chess-board"
        ref={boardRef}
        onClick={handleLeftClick}
        onContextMenu={handleRightClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div className="board">
          {rows.map((row, rowIndex) =>
            columns.map((col, colIndex) => {
              const isLightSquare = (rowIndex + colIndex) % 2 === 0;
              const squareClass = isLightSquare ? 'square light' : 'square dark';
              const labelColor = isLightSquare ? 'label-dark' : 'label-light';
              const squareKey = `${col}${row}`;
              return (
                <div 
                  key={squareKey} 
                  className={squareClass}
                  onMouseDown={(e) => handleMouseDown(e, squareKey)}
                >
                  {(row === 1 && col === 'h') && (
                    <>
                      <span className={`label bottom ${labelColor}`}>{col}</span>
                      <span className={`label right ${labelColor}`}>{row}</span>
                    </>
                  )}
                  {(row === 1 && col !== 'h') && (
                    <span className={`label bottom ${labelColor}`}>{col}</span>
                  )}
                  {(col === 'h' && row !== 1) && (
                    <span className={`label right ${labelColor}`}>{row}</span>
                  )}
                  {overlay[squareKey] && <div className="circle-overlay"></div>}
                </div>
              );
            })
          )}
          <svg className="line-overlay">
            {lines.map((line, index) => {
              const start = getSquareCenter(line.start);
              const end = getSquareCenter(line.end);
              return (
                <line
                  key={index}
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke="#15781B"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              );
            })}
            {currentLine && currentLine.start !== currentLine.end && (
              <line
                x1={getSquareCenter(currentLine.start).x}
                y1={getSquareCenter(currentLine.start).y}
                x2={getSquareCenter(currentLine.end).x}
                y2={getSquareCenter(currentLine.end).y}
                stroke="#15781B"
                strokeWidth="6"
                strokeLinecap="round"
              />
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}

export default App;
