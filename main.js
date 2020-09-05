const gameBoard = (() => {
    let gameBoardArray = [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
    ];

    return { gameBoardArray };
})();

const domElements = (() => {
        const _gameBoardElem = document.querySelector('.gameboard');

        const gameBoardCells = [..._gameBoardElem.querySelectorAll('div')];

    return { gameBoardCells }
})();

const displayController = (() => {
    // render gameboard array to screen
    const render = () => {
        domElements.gameBoardCells.forEach(cell => {
            cell.textContent =
                gameBoard.gameBoardArray[cell.dataset.row][cell.dataset.column];
        });
    };

    return { render };
})();
