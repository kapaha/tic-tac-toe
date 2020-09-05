const playerFactory = (name, mark) => {
    return { name, mark };
};

const domElements = (() => {
        const _gameBoardElem = document.querySelector('.gameboard');

        const gameBoardCells = [..._gameBoardElem.querySelectorAll('div')];

    return { gameBoardCells }
})();

const gameBoard = (() => {
    let _gameBoardArray = [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
    ];

    // return value of array element
    const getValue = (row, column) => _gameBoardArray[row][column];

    // change value of array element
    const editGameBoard = (row, column, newValue) => {
        _gameBoardArray[row][column] = newValue;
        displayController.render();
    };

    // set all array elements to empty string
    const clearGameBoard = () => {
        _gameBoardArray.forEach(row => row.fill(''));
        displayController.render();
    };

    return { getValue, editGameBoard, clearGameBoard};
})();

const displayController = (() => {
    // render gameboard array to screen
    const render = () => {
        domElements.gameBoardCells.forEach(cell => {
            cell.textContent =
                gameBoard.getValue(cell.dataset.row, cell.dataset.column);
        });
    };

    return { render };
})();

const gameController = (() => {
    const players = {
        player1: playerFactory('Player1', 'X'),
        player2: playerFactory('Player2', 'O'),
    };

    let currentPlayer = players.player1;

    const processCellClick = (event) => {
        const cell = {
            element: event.target,
            row: event.target.dataset.row,
            column: event.target.dataset.column
        }
    
        // if cell is blank
        if (gameBoard.getValue(cell.row, cell.column) == '')
        {
            const currentPlayer = getCurrentPlayer();

            // update cell with players mark
            gameBoard.editGameBoard(cell.row, cell.column, currentPlayer.mark);


            // testing
            console.log(`${currentPlayer.name} placed a ${currentPlayer.mark} @ [${cell.row}][${cell.column}]`);
        }
    };

    const getCurrentPlayer = () => {
        if (currentPlayer === players.player1) {
            currentPlayer = players.player2;
            return players.player1;
        } else {
            currentPlayer = players.player1;
            return players.player2;
        }
    };

    return { processCellClick };
})();


const eventController = (() => {
    // set event listeners
    domElements.gameBoardCells.forEach(cell => {
        cell.addEventListener('click', gameController.processCellClick);
    });
})();
