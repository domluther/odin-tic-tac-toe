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
  createBoard();
  return { gameboard };
})();

console.log(gameBoard.gameboard);

const Player = (name, desiredCounter) => {
  const playerName = name;
  const counter = desiredCounter;
};
