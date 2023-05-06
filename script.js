// A gameboard to store the state of the game
// in a module as only one will be needed
const gameBoard = (() => {
  const gameboard = [];

  // Creates base grid
  const createBoard = () => {
    const rows = 3;
    const columns = 3;
    const defaultContent = ' ';
    // For each row - create a new empty array
    for (let row = 0; row < rows; row += 1) {
      gameboard.push([]);
      // Fill that array with blank spaces
      for (let column = 0; column < columns; column += 1) {
        gameboard[row][column] = defaultContent;
      }
    }
  };

  // If the place is taken, reject the move - also works if out of bound as that is undefined
  const addPiece = (x, y, mark) => {
    if (gameboard[x][y] !== ' ') {
      console.log('Space taken');
      return false;
    }

    // Not taken? Mark the spot
    gameboard[x][y] = mark;
    return true;
  };

  // Check an individual line for a win
  const checkLine = (line, mark) => {
    const res = line
      .map((coords) => gameboard[coords[0]][coords[1]] === mark)
      .reduce((acc, cur) => (cur === true ? acc + 1 : acc), 0);

    return res === 3;
  };

  // Check all
  const checkBoardForWin = (mark) => {
    // The 8 winning lines in noughts and crosses
    const winningLines = [
      [
        [0, 0],
        [0, 1],
        [0, 2],
      ],
      [
        [0, 0],
        [1, 1],
        [2, 2],
      ],
      [
        [0, 0],
        [1, 0],
        [2, 0],
      ],
      [
        [0, 1],
        [1, 1],
        [2, 1],
      ],
      [
        [0, 2],
        [1, 2],
        [2, 2],
      ],
      [
        [0, 2],
        [1, 1],
        [2, 0],
      ],
      [
        [1, 0],
        [1, 1],
        [1, 2],
      ],
      [
        [2, 0],
        [2, 1],
        [2, 2],
      ],
    ];

    const results = winningLines
      // Check each of the possible winning line combinations for a win
      .map((line) => checkLine(line, mark))
      // just keep the trues
      .filter((value) => value === true);

    // Are there any trues?
    return results.length > 0;
  };

  // Init the board
  createBoard();
  addPiece(2, 0, 'x');
  addPiece(2, 1, 'x');
  addPiece(2, 2, 'x');
  checkBoardForWin('x');
  return { gameboard, addPiece };
})();

const displayController = () => {};

const Player = (name, desiredMark) => {
  const playerName = name;
  const mark = desiredMark;
};

/*
Gameplay loop

Set starting player
while there's space available (not 9 moves?) & no one has won
  ask player to move
  place move if possible
  check if they've won
  swap player
*/
