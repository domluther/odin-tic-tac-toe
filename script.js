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
    // space taken
    if (gameboard[x][y] !== ' ') {
      return false;
    }

    // Not taken? Mark the spot
    gameboard[x][y] = mark;
    return true;
  };

  // Check an individual line for a win
  const checkLine = (line, mark, count = 3) => {
    const res = line
      .map((coords) => gameboard[coords[0]][coords[1]] === mark)
      .reduce((acc, cur) => (cur === true ? acc + 1 : acc), 0);

    // if (res === 2) {
    //   console.log(line);
    // }
    return res === count;
  };

  // Are there any wins?
  const checkBoardForWin = (mark, count = 3) => {
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
    // Is it a win?
    if (count === 3) {
      const results = winningLines
        // Check each of the possible winning line combinations for a win
        .map((line) => checkLine(line, mark, count))
        // just keep the trues
        .filter((value) => value === true);

      // Are there any trues?
      return results.length > 0;
    }
    // When looking for potential wins

    const results = winningLines
      // Check each of the line combinations for a possible win (2 marks of the correct type)
      .map((line) => checkLine(line, mark, count))
      .reduce((arr, ele, index) => {
        if (ele === true) arr.push(index);
        return arr;
      }, []);
    // Is there a true? If so which line
    let lineOfInterest;
    results.forEach((index) => {
      if (checkLine(winningLines[index], ' ', 1)) {
        lineOfInterest = winningLines[index];
      }
    });
    if (lineOfInterest) return lineOfInterest;
    return false;
  };

  // Finds a potential line of interest - one with 2 marks of the same type
  const checkBoardForPotentialWin = (mark) => {
    const lineOfInterest = checkBoardForWin(mark, 2);
    return lineOfInterest;
  };

  // Init the board
  createBoard();
  return {
    getBoard,
    addPiece,
    checkBoardForWin,
    renderBoard,
    resetBoard,
    checkBoardForPotentialWin,
  };
})();

const Player = (name, desiredMark) => {
  const playerName = name;
  const mark = desiredMark;
  return { playerName, mark };
};

let players = [];
let mode;
let aiMovesMade = [];

const gameController = (() => {
  // State variables needed for the game
  let moves;
  const maxMoves = 9;
  let activePlayerId;
  let activePlayer;
  let playerPointer;
  let won;

  const corners = [
    [0, 0],
    [0, 2],
    [2, 2],
    [2, 0],
  ];

  const updateStatus = (message) => {
    const gameStatusEle = document.querySelector('.game-status');
    gameStatusEle.textContent = message;
  };

  const randomFromList = (items) =>
    items[Math.floor(Math.random() * items.length)];

  // Put a counter in a random position
  const randomMove = () => {
    let validMove = false;
    while (!validMove) {
      const move = [
        Math.floor(Math.random() * 3),
        Math.floor(Math.random() * 3),
      ];
      validMove = gameBoard.addPiece(move[0], move[1], activePlayer.mark);
      if (validMove) {
        aiMovesMade.push(corners.findIndex((corner) => corner === move));
      }
    }
  };

  const randomCorner = () => {
    let validMove = false;
    while (!validMove) {
      const move = randomFromList(corners);
      validMove = gameBoard.addPiece(move[0], move[1], activePlayer.mark);
      if (validMove) {
        aiMovesMade.push(corners.findIndex((corner) => corner === move));
      }
    }
  };

  // Fill in the gap in an interesting line
  const fromLineOfInterest = (lineOfInterest) => {
    let validMove = false;
    while (!validMove) {
      const move = randomFromList(lineOfInterest);
      validMove = gameBoard.addPiece(move[0], move[1], activePlayer.mark);
    }
  };

  const aiMove = () => {
    if (mode === 'two-player') throw Error('In wrong mode');

    // Move 1: Go in a corner.
    if (moves === 1) {
      randomCorner();
    }
    // Move 2: If the other player did not go there then go in the opposite corner to move 1. Otherwise go in a free corner.
    else if (moves === 3) {
      // Find the co-ordinates of the opposite corner
      const move = corners.at(aiMovesMade[0] - 2);
      const validMove = gameBoard.addPiece(move[0], move[1], activePlayer.mark);
      if (!validMove) {
        randomCorner();
      }
    }
    // Move 3: If there are two Xs and a space in a line (in any order) then go in that space. Otherwise if there are two Os and a space in a line then go in that space. Otherwise go in a free corner.
    // Move 4: If there are two Xs and a space in a line (in any order) then go in that space. Otherwise if there are two Os and a space in a line then go in that space. Otherwise go in a free corner.
    else if (moves === 5 || moves === 7) {
      // Can I win?
      const lineOfInterestMe = gameBoard.checkBoardForPotentialWin(
        activePlayer.mark
      );
      if (lineOfInterestMe) {
        fromLineOfInterest(lineOfInterestMe);
      } else {
        // Can I block you?
        const lineOfInterestYou = gameBoard.checkBoardForPotentialWin('O');
        if (lineOfInterestYou) {
          fromLineOfInterest(lineOfInterestYou);
        } else {
          randomCorner();
        }
      }
    } else {
      // Move 5: Go in the free space.
      randomMove();
    }
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
          if (mode === 'v-computer') {
            aiMove();
          }
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
  mode = document.querySelector('#game-mode').value;

  // Create player objects
  players = [Player(player1Name, 'O'), Player(player2Name, 'X')];
  aiMovesMade = [];
  init();
});
