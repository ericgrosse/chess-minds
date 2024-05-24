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
import moveSound from './audio/move.mp3';
import { Chess } from 'chess.js';

function App() {
  const chess = useRef(new Chess());
  const boardRef = useRef(null);
  const moveAudio = new Audio(moveSound);

  /* Setup for state initialization */
  const rows = [8, 7, 6, 5, 4, 3, 2, 1];
  const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  const initialOverlayState = rows.reduce((acc, row) => {
    columns.forEach(col => {
      acc[`${col}${row}`] = false;
    });
    return acc;
  }, {});

  /* State initialization */
  const [overlay, setOverlay] = useState(initialOverlayState);
  const [lines, setLines] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [currentLine, setCurrentLine] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [sourceSquare, setSourceSquare] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(chess.current.fen());

  const pieceImages = {
    'w-p': whitePawn, 'w-n': whiteKnight, 'w-b': whiteBishop, 'w-r': whiteRook, 'w-q': whiteQueen, 'w-k': whiteKing,
    'b-p': blackPawn, 'b-n': blackKnight, 'b-b': blackBishop, 'b-r': blackRook, 'b-q': blackQueen, 'b-k': blackKing,
  };

  /* Event handlers */

  const handleRightClick = (e) => {
    e.preventDefault(); // Prevents the default context menu from appearing
  };

  const handleSquareClick = (square) => {
    if (legalMoves.includes(square)) {
      const moveOptions = { from: sourceSquare, to: square };
      
      // Detect pawn promotion
      const piece = chess.current.get(sourceSquare);
      if (piece && piece.type === 'p' && (square[1] === '8' || square[1] === '1')) {
        moveOptions.promotion = 'q'; // Automatically promote to a queen
      }

      chess.current.move(moveOptions);
      setCurrentPosition(chess.current.fen());
      moveAudio.play();
  
      // Check for game state after the move
      if (chess.current.isCheckmate()) {
        alert('Checkmate');
      } else if (chess.current.isStalemate()) {
        alert('Stalemate');
      } else if (chess.current.isCheck()) {
        alert('Check');
      }
    }
  
    setLegalMoves([]);
    setSourceSquare(null);
    setOverlay(initialOverlayState);
    setLines([]);
    setCurrentLine(null);
  };  

  const handlePieceClick = (e, square) => {
    e.stopPropagation();
    const piece = chess.current.get(square);
    if (piece && piece.color === chess.current.turn()) {
      const moves = chess.current.moves({ square, verbose: true });
      setSourceSquare(square);
      setLegalMoves(moves.map(move => move.to));
    }
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

  const isLegalMove = (square) => {
    return legalMoves.includes(square);
  };

  const renderPiece = (square) => {
    const piece = chess.current.get(square);
    if (piece) {
      return (
        <img
          src={pieceImages[piece.color + '-' + piece.type]}
          alt={piece}
          className="chess-piece"
          onClick={(e) => handlePieceClick(e, square)}
        />
      );
    }
    return null;
  };

  const renderSquare = (row, col) => {
    const square = `${col}${row}`;
    const isLightSquare = (row + columns.indexOf(col)) % 2 === 0;
    const squareClass = isLightSquare ? 'square light' : 'square dark';
    const labelColor = isLightSquare ? 'label-dark' : 'label-light';
    const squareKey = `${col}${row}`;
    return (
      <div
        key={squareKey}
        className={squareClass}
        onMouseDown={(e) => handleMouseDown(e, squareKey)}
        onClick={() => handleSquareClick(square)}
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
        {renderPiece(square)}
        {overlay[square] && <div className="circle-overlay"></div>}
        {isLegalMove(square) && <div className="legal-move-overlay"></div>}
      </div>
    );
  };

  return (
    <div className="App">
      <div
        className="chess-board"
        ref={boardRef}
        onContextMenu={handleRightClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div className="board">
          {rows.map((row, rowIndex) =>
            columns.map((col, colIndex) => {
              return renderSquare(row, col);
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
