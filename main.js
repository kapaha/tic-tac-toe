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

    // store announcer p tag element
    const announcerElem = document.querySelector('.announcer');

    return { gameBoardCells, announcerElem}
})();

// module for manipulating the DOM
const displayController = (() => {
    // render gameboard array to screen
    const render = () => {
        domElements.gameBoardCells.forEach(cell => {
            cell.textContent =
                gameBoard.getValue(cell.dataset.index);
        });
    };

    // set textContent of a element
    const setTextContent = (element, text) => {
        element.textContent = text;
    };

    // show an element
    const showElement = (element) => {
        element.classList.add('is-visible');
    };

    // hide an element
    const hideElement = (element) => {
        element.classList.remove('is-visible');
    };

    // add class to elements
    const addClassToElements = (elements, htmlClass) => {
        elements.forEach(element => element.classList.add(`${htmlClass}`))
    };

    // remove class to elements
    const removeClassFromElements = (elements, htmlClass) => {
        elements.forEach(element => element.classList.remove(`${htmlClass}`))
    };

    return {
        render,
        setTextContent,
        showElement,
        hideElement,
        addClassToElements,
        removeClassFromElements
    };
})();

// module for manipulating gameboard
const gameBoard = (() => {
    let _gameBoardArray = [
        '', '', '',
        '', '', '',
        '', '', ''
    ];

    // return value of array element
    const getValue = (index) => _gameBoardArray[index];

    // change value of array element
    const editGameBoard = (index, newValue) => {
        _gameBoardArray[index] = newValue;
        displayController.render();
    };

    // set all array elements to empty string
    const clearGameBoard = () => {
        _gameBoardArray.fill('');
        displayController.render();
    };

    return { getValue, editGameBoard, clearGameBoard };
})();

// module for controlling the game
const gameController = (() => {
    let players = null;
    let currentPlayer = null;
    let turn = 1;

    // all possible winning combinations (lines)
    const winningCombinations = [
        [0, 1, 2],
        [3 ,4 ,5],
        [6, 7, 8],
        [0, 3, 6],
        [1 ,4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    // start the game
    const startGame = () => {
        // reset game to starting settings
        reset();

        // get players
        players = getPlayers();

        // set current player
        currentPlayer = players.player1;

        // set click event listener on cells that only fires once
        eventController.addEvent(
            domElements.gameBoardCells,
            'click',
            processCellClick,
            { once: true }
        );
    };

    // end the game
    const endGame = () => {
        // remove click event listener on cells
        eventController.removeEvent(
            domElements.gameBoardCells,
            'click',
            processCellClick
        );
    };

    // reset game settings
    const reset = () => {
        // reset players and current player and turn
        players = null;
        currentPlayer = null;
        turn = 1;

        // reset gameboard
        gameBoard.clearGameBoard();

        // hide announcement msg
        displayController.hideElement(domElements.announcerElem);
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
        // get the click cell info
        const cell = {
            element: event.target,
            index: event.target.dataset.index
        }

        // get the current player
        const currentPlayer = getCurrentPlayer();

        // update cell with players mark
        gameBoard.editGameBoard(cell.index, currentPlayer.mark);

        // get winner if there is one
        const winner = getWinner(currentPlayer);

    
        // announce if theres a winner or draw and end the game, else next round
        if (winner) {
            announce('win', winner);
            endGame();
        } else if (isDraw()) {
            announce('draw');
            endGame();
        } else {
            turn++;
        }
    };

    // check if there is a winnner
    const getWinner = (player) => {
        let winner = null;

        // returns true if value at index is equal to players mark
        const isEqualMark = (index) => gameBoard.getValue(index) === player.mark;

        // return a winner if player has three marks in a row
        winningCombinations.forEach(combination => {
            if(combination.every(isEqualMark)) {
                winner = {
                    player,
                    winningCombination: combination
                };
            }
        });

        return winner;
    };

    // check if it is a draw
    const isDraw = () => turn === 9;

    // announce winner or draw
    const announce = (status, winner) => {
        const announcerElem = domElements.announcerElem;
        switch (status) {
            case 'win':
                displayController.setTextContent(
                    announcerElem,
                    `${winner.player.name} wins with ${winner.player.mark}'s`
                );
                displayController.showElement(announcerElem);
                break;
            case 'draw':
                displayController.setTextContent(announcerElem, 'Draw!');
                displayController.showElement(announcerElem);
                break;
            default:
                break;
        }
    };

    return { startGame };
})();

// module for creating event listeners
const eventController = (() => {
    // add event listener
    const addEvent = (target, type, listener, options) => {
        target.forEach(element => {
            element.addEventListener(`${type}`, listener, options);
        });
    };

    // remove event listener
    const removeEvent = (target, type, listener) => {
        target.forEach(element => {
            element.removeEventListener(`${type}`, listener);
        });
    };

    return { addEvent, removeEvent };
})();

// start the game
gameController.startGame();