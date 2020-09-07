// factory for creating players
const playerFactory = (name, mark) => {
    return { name, mark };
};

// module for storing and returning DOM elements
const domElements = (() => {
    // store gameboard element
    const _gameBoardElem = document.querySelector('.gameboard');

    // store each cell in gameboard element
    const gameBoardCells = [..._gameBoardElem.querySelectorAll('div')];

    return { gameBoardCells }
})();

// module for manipulating the DOM
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

// module for maniuplating gameboard
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

    // get row, column of a cell and both diagonals of gameboard
    const getRowColumnDiagonals = (cell) => {
        // store gameboard in shorter named variable for ease of use
        const g = _gameBoardArray;

        // store row and column values of cell
        const r = parseInt(cell.row);
        const c = parseInt(cell.column);

        // store values of row cell is in
        const row = g[r];

        // store values of column cell is in
        const column = [g[0][c], g[1][c], g[2][c]];

        // store values of diagonals on gameboard
        const diagonal1 = [g[0][0], g[1][1], g[2][2]];
        const diagonal2 = [g[2][0], g[1][1], g[0][2]];

        return { row, column, diagonal1, diagonal2 };
    };

    return { getValue, editGameBoard, clearGameBoard, getRowColumnDiagonals };
})();

// module for controlling the game
const gameController = (() => {
    let players = null;
    let currentPlayer = null;
    let turn = 1;

    // start the game
    const startGame = () => {
        // FOR TESTING
        console.group('StartGame');

        // get players
        players = getPlayers();

        // set current player
        currentPlayer = players.player1;

        // set click event listener on cells
        eventController.addEvent(
            domElements.gameBoardCells,
            'click',
            processCellClick
        );

        // FOR TESTING
        console.log('Game Started!');
        console.groupEnd();
    };

    // end the game
    const endGame = () => {
        // FOR TESTING
        console.group('EndGame');

        // reset players and current player and turn
        players = null;
        currentPlayer = null;
        turn = 1;

        // remove click event listener on cells
        eventController.removeEvent(
            domElements.gameBoardCells,
            'click',
            processCellClick
        );
        
        // FOR TESTING
        console.log('Game Ended!');
        console.groupEnd();
    };

    // get players, TODO: get user input for player names
    const getPlayers = () => {
        const players = {
            player1: playerFactory('Player1', 'X'),
            player2: playerFactory('Player2', 'O'),
        };

        return players;
    };

    // get the current player then change current player to the other one
    const getCurrentPlayer = () => {
        const previousPlayer = currentPlayer;

        if (currentPlayer === players.player1) {
            // swap the current player
            currentPlayer = players.player2;
        } else {
            // swap the current player
            currentPlayer = players.player1;
        }

        return previousPlayer;
    };

    // proccess the click event on a cell
    const processCellClick = (event) => {
        const cell = {
            element: event.target,
            row: event.target.dataset.row,
            column: event.target.dataset.column
        }

        // if cell is empty
        if (gameBoard.getValue(cell.row, cell.column) === '') {
            // get the current player
            const currentPlayer = getCurrentPlayer();

            // update cell with players mark
            gameBoard.editGameBoard(cell.row, cell.column, currentPlayer.mark);

            // check for winner or draw
            if (isWinnerOrDraw(cell, currentPlayer)) {
                endGame();
            } else {
                turn++;
            }
        }
    };

    // check if there is a winner of it a draw then call a announcement
    const isWinnerOrDraw = (cell, currentPlayer) => {
            // get winner if there is one
            const winner = isWinner(cell, currentPlayer);

            // announce winner or draw
            if (winner) {
                announce('win', winner);
            } else if (isDraw()) {
                announce('draw');
            }

            // return true if there is a winner or if its a draw
            return winner || isDraw();
    };

    // check if there is a winnner
    const isWinner = (cell, currentPlayer) => {
        // get row, column, and diagonals object for cell and convert to array
        const entries = Object.entries(gameBoard.getRowColumnDiagonals(cell));

        // initalize bool to check if current value is equal to the players mark
        const isEqualMark = (currentValue) => currentValue === currentPlayer.mark;

        // loop through arrays created from Object.entries
        for (const [type, array] of entries) {
            // if all values are equal to the players mark
            if (array.every(isEqualMark)) {
                // return winner
                return {
                    name: currentPlayer.name,
                    type: type
                }
            }
        }
    };

    // check if it is a draw
    const isDraw = () => turn === 9;

    // announce winner or draw
    const announce = (status, winner) => {
        // FOR TESTING
        console.group('Announce');
        switch (status) {
            case 'win':
                console.log(`Winner! ${winner.name} wins with 3 in a ${winner.type}.`);
                break;
            case 'draw':
                console.log(`Draw!`);
                break;
            default:
                console.log('Error please add status argument');
                break;
        }
        console.groupEnd();
    };

    return { startGame };
})();

// module for creating event listeners
const eventController = (() => {
    // add event listener
    const addEvent = (target, type, listener) => {
        target.forEach(element => {
            element.addEventListener(`${type}`, listener);
        });
        // FOR TESTING
        console.log(`${type} event added.`);
    };

    // remove event listener
    const removeEvent = (target, type, listener) => {
        target.forEach(element => {
            element.removeEventListener(`${type}`, listener);
        });
        // FOR TESTING
        console.log(`${type} event removed.`);
    };

    return { addEvent, removeEvent };
})();

// start the game
gameController.startGame();