import './App.scss';

function App() {
  const rows = [8, 7, 6, 5, 4, 3, 2, 1];
  const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  return (
    <div className="App">
      <div className="chess-board">
        <div className="board">
          {rows.map((row, rowIndex) =>
            columns.map((col, colIndex) => {
              const isLightSquare = (rowIndex + colIndex) % 2 === 0;
              const squareClass = isLightSquare ? 'square light' : 'square dark';
              const labelColor = isLightSquare ? 'label-dark' : 'label-light';
              return (
                <div key={`${col}${row}`} className={squareClass}>
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
