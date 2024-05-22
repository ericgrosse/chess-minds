import React, { useState } from 'react';
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

  const handleRightClick = (e, square) => {
    e.preventDefault(); // Prevents the default context menu from appearing
  };

  const handleLeftClick = () => {
    setOverlay(initialOverlayState);
  };

  const handleMouseDown = (e, square) => {
    if (e.button === 2) { // Right mouse button
      e.preventDefault();
      setOverlay(prevOverlay => ({
        ...prevOverlay,
        [square]: !prevOverlay[square] // Toggle the circle overlay
      }));
    }
  };

  return (
    <div className="App" onClick={handleLeftClick}>
      <div className="chess-board">
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
                  onContextMenu={(e) => handleRightClick(e, squareKey)}
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
        </div>
      </div>
    </div>
  );
}

export default App;
