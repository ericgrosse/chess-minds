import React, { useState, useRef } from 'react';
import './App.scss';
import whitePawn from './images/white-pawn.svg';
import whiteKnight from './images/white-knight.svg';
import whiteBishop from './images/white-bishop.svg';
import whiteRook from './images/white-rook.svg';
import whiteQueen from './images/white-queen.svg';
import whiteKing from './images/white-king.svg';
import blackPawn from './images/black-pawn.svg';
import blackKnight from './images/black-knight.svg';
import blackBishop from './images/black-bishop.svg';
import blackRook from './images/black-rook.svg';
import blackQueen from './images/black-queen.svg';
import blackKing from './images/black-king.svg';
import { Chess } from 'chess.js';

function App() {
  const rows = [8, 7, 6, 5, 4, 3, 2, 1];
  const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  const initialOverlayState = rows.reduce((acc, row) => {
    columns.forEach(col => {
      acc[`${col}${row}`] = false;
    });
    return acc;
  }, {});

  const initialPieces = {
    'a1': 'white-rook', 'b1': 'white-knight', 'c1': 'white-bishop', 'd1': 'white-queen', 'e1': 'white-king', 'f1': 'white-bishop', 'g1': 'white-knight', 'h1': 'white-rook',
    'a2': 'white-pawn', 'b2': 'white-pawn', 'c2': 'white-pawn', 'd2': 'white-pawn', 'e2': 'white-pawn', 'f2': 'white-pawn', 'g2': 'white-pawn', 'h2': 'white-pawn',
    'a7': 'black-pawn', 'b7': 'black-pawn', 'c7': 'black-pawn', 'd7': 'black-pawn', 'e7': 'black-pawn', 'f7': 'black-pawn', 'g7': 'black-pawn', 'h7': 'black-pawn',
    'a8': 'black-rook', 'b8': 'black-knight', 'c8': 'black-bishop', 'd8': 'black-queen', 'e8': 'black-king', 'f8': 'black-bishop', 'g8': 'black-knight', 'h8': 'black-rook',
  };

  const pieceImages = {
    'white-pawn': whitePawn, 'white-knight': whiteKnight, 'white-bishop': whiteBishop, 'white-rook': whiteRook, 'white-queen': whiteQueen, 'white-king': whiteKing,
    'black-pawn': blackPawn, 'black-knight': blackKnight, 'black-bishop': blackBishop, 'black-rook': blackRook, 'black-queen': blackQueen, 'black-king': blackKing,
  };

  const [overlay, setOverlay] = useState(initialOverlayState);
  const [lines, setLines] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [currentLine, setCurrentLine] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const chess = useRef(new Chess()); // Initialize chess.js
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
          if (currentLine.start !== endSquare) {
            setOverlay(prevOverlay => ({
              ...prevOverlay,
              [currentLine.start]: false
            }));
          }
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

  const handlePieceClick = (square) => {
    const moves = chess.current.moves({ square, verbose: true });
    setLegalMoves(moves.map(move => move.to));
  };

  const isLegalMove = (square) => {
    return legalMoves.includes(square);
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
              const piece = initialPieces[squareKey];

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
                  {piece && (
                    <img
                      src={pieceImages[piece]}
                      alt={piece}
                      className="chess-piece"
                      onClick={() => handlePieceClick(squareKey)}
                    />
                  )}
                  {overlay[squareKey] && <div className="circle-overlay"></div>}
                  {isLegalMove(squareKey) && <div className="legal-move-overlay"></div>}
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
