// A gameboard to store the state of the game
// in a module as only one will be needed
const gameContentEle = document.querySelector('.game-content');
const restartBtn = document.querySelector('.restart-btn');
const settingsForm = document.querySelector('.game-settings');

const gameBoard = (() => {
  let gameboard = [];

  const getBoard = () => gameboard;

  const getValue = (x, y) => gameboard[x][y];

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

  const resetBoard = () => {
    gameboard = [];
    createBoard();
  };

  const createSquare = (x, y, mark) => {
    const divEle = document.createElement('div');
    divEle.className = 'square';
    divEle.dataset.x = x;
    divEle.dataset.y = y;
    divEle.textContent = mark;
    return divEle;
  };

  const renderBoard = () => {
    // Reset HTML and then create
    gameContentEle.innerHTML = '';
    for (let row = 0; row < 3; row += 1) {
      for (let column = 0; column < 3; column += 1) {
        gameContentEle.appendChild(
          createSquare(row, column, getValue(row, column))
        );
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

  // Are there any wins?
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
  return { getBoard, addPiece, checkBoardForWin, renderBoard, resetBoard };
})();

const Player = (name, desiredMark) => {
  const playerName = name;
  const mark = desiredMark;
  return { playerName, mark };
};

let players = [];

const gameController = (() => {
  // State variables needed for the game
  let moves;
  const maxMoves = 9;
  let activePlayerId;
  let activePlayer;
  let playerPointer;
  let won;

  const updateStatus = (message) => {
    const gameStatusEle = document.querySelector('.game-status');
    gameStatusEle.textContent = message;
  };

  const tryToMove = (e) => {
    // Did they click a square?
    const currentSquare = e.target.closest('.square');
    if (!currentSquare) return;
    // Get the coords of the square
    const { x, y } = e.target.dataset;
    // Try to add a piece
    const validMove = gameBoard.addPiece(x, y, activePlayer.mark);
    if (validMove) {
      gameBoard.renderBoard();
      won = gameBoard.checkBoardForWin(activePlayer.mark);
      // Not won? Swap the player
      if (!won) {
        activePlayerId = activePlayerId === 1 ? 0 : 1;
        activePlayer = players[activePlayerId];
        playerPointer = activePlayerId === 0 ? '<<' : '>>';

        moves += 1;
        // Is it game over? (board full)
        if (moves < maxMoves) {
          updateStatus(
            `${players[0].playerName} ${playerPointer} ${players[1].playerName}`
          );
        } else {
          updateStatus('A draw');
        }
      }
      if (won) {
        updateStatus(`${activePlayer.playerName} wins!`);
        gameContentEle.removeEventListener('click', tryToMove);
      }
    }
  };

  const start = () => {
    gameContentEle.removeEventListener('click', tryToMove);
    moves = 0;
    won = false;
    activePlayerId = 0;
    activePlayer = players[activePlayerId];
    playerPointer = activePlayerId === 0 ? '<<' : '>>';
    gameContentEle.addEventListener('click', tryToMove);
    updateStatus(
      `${players[0].playerName} ${playerPointer} ${players[1].playerName}`
    );
  };
  return { start };
})();

const init = () => {
  gameBoard.resetBoard();
  gameBoard.renderBoard();
  gameController.start();
};

restartBtn.addEventListener('click', () => {
  document.querySelector('.game-controls').classList.add('hidden');
  document.querySelector('.game-settings').classList.remove('hidden');
});
settingsForm.addEventListener('submit', (e) => {
  e.preventDefault();
  // Toggle visibility of elements
  document.querySelector('.game-content').classList.remove('hidden');
  document.querySelector('.game-status').classList.remove('hidden');
  document.querySelector('.game-controls').classList.remove('hidden');
  document.querySelector('.game-settings').classList.add('hidden');

  // Read in names
  const player1Name = document.querySelector('#player1Name').value;
  const player2Name = document.querySelector('#player2Name').value;

  // Create player objects
  players = [Player(player1Name, 'O'), Player(player2Name, 'X')];
  init();
});
