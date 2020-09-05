const gameBoard = (() => {
    let gameBoardArray = [
        ['X', 'X', 'X'],
        ['X', 'O', 'X'],
        ['X', 'X', 'O']
    ];

    return { gameBoardArray };
})();

const displayController = (() => {
    // get DOM elements
    const gameBoardElement = document.querySelector('.gameboard');
    const gameBoardCells = gameBoardElement.querySelectorAll('div');

    // render gameboard array to screen
    const render = () => {
        gameBoardCells.forEach(cell => {
            cell.textContent =
                gameBoard.gameBoardArray[cell.dataset.row][cell.dataset.column];
        });
    };

    return { render };
})();