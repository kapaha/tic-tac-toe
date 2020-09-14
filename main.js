// factory for creating players
const playerFactory = (name, mark) => {
    return { name, mark };
};

// factory for creating AI
const AIFactory = (name, mark) => {
    const isAI = true;

    const winningCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    const findEmptyCells = () => {
        // get all empty cells on board
        const emptyCells = gameBoard.getEmptyCellsIndexs();

        // get a random number between 0 and amount of empty cells
        const randomNumber = Math.floor(Math.random() * emptyCells.length);

        // return index of empty cell
        return emptyCells[randomNumber];
    };

    const testWin = () => {
        const mark = 'X'
        const cellsToMark = [4, 8];

        cellsToMark.forEach(cell => {
            gameBoard.editGameBoard(cell, mark);
        });
    };

    const preventThreeInRow = () => {
        // get empty cells indexs
        const emptyCellsIndex = gameBoard.getEmptyCellsIndexs();

        // get opponents mark
        const opMark = 'X';

        // create copy of gameboard
        const gb = gameBoard.copyGameBoard();

        // checks if value at index in gameboard is equal to opponents mark

        let indexToStopWin = null;

        emptyCellsIndex.some(index => {
            const gbCopy = [...gb];
            // place opponents mark in empty cells
            gbCopy[index] = opMark;

            const isEqualMark = (index) => gbCopy[index] === opMark;
            return winningCombinations.some(combination => {
                if(combination.every(isEqualMark)) {
                    indexToStopWin = index;
                    return true;
                }
            });
        });

        // if there is a index to stop a win return true else false
        if (indexToStopWin !== null) {
            // place mark to stop
            gameBoard.editGameBoard(indexToStopWin, 'O');

            return true;
        }

        return false;
    };

    const takeTurn = (mark) => {

        if (preventThreeInRow()) return;
        // place a mark in a empty cell
        gameBoard.editGameBoard(findEmptyCells(), mark);
    };

    return { name, mark, isAI, findEmptyCells, takeTurn, preventThreeInRow, testWin };
};

// module for storing and returning DOM elements
const domElems = (() => {
    const _gameBoardElem = document.querySelector('.gameboard');
    const gameBoardCells = [..._gameBoardElem.querySelectorAll('div')];
    const announcerElem = document.querySelector('.announcer');

    const modeSelectbtns = document.getElementById('mode-select-btns');
    const gameForm = document.getElementById('game-form');
    const gameFormElems = {
        p1Input: gameForm.querySelector('#p1-name-input'),
        p1Label: gameForm.querySelector('label[for="p1-name-input"]'),
        p2Input: gameForm.querySelector('#p2-name-input'),
        p2Label: gameForm.querySelector('label[for="p2-name-input"]'),
        startBtn: gameForm.querySelector('#start-btn'),
        backBtn: gameForm.querySelector('#back-btn')
    };

    return {
        gameBoardCells,
        announcerElem,
        modeSelectbtns,
        gameForm,
        gameFormElems,
    };
})();

// module for manipulating the DOM
const displayController = (() => {
    // render gameboard array to screen
    const render = () => {
        domElems.gameBoardCells.forEach(cell => {
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


    // get empty cells indexs on gameboard
    const getEmptyCellsIndexs = () => {
        let emptyCells = [];

        _gameBoardArray.forEach((value, index) => {
            if (value === '') emptyCells.push(index);
        });

        return emptyCells;
    };

    // return a copy of the gameboard array
    const copyGameBoard = () => {
        return [..._gameBoardArray];
    };

    return {
        getValue,
        editGameBoard,
        clearGameBoard,
        getEmptyCellsIndexs,
        copyGameBoard
    };
})();

// module for controlling the game
const gameController = (() => {
    let players = null;
    let currentPlayer = null;
    let turn = 1;
    let gamemode = null;

    // all possible winning combinations (lines)
    const winningCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    const handleModeSelect = (event) => {
        // set gamemode
        gamemode = event.target.dataset.mode;

        // show player 2 input field if gamemode is multiplayer
        if (gamemode === 'mp') {
            displayController.showElement(domElems.gameFormElems.p2Input);
            displayController.showElement(domElems.gameFormElems.p2Label);
        }

        // hide mode select btns
        displayController.hideElement(domElems.modeSelectbtns);

        // show form
        displayController.showElement(domElems.gameForm);
    };

    const backToModeSelect = () => {
        // reset game settings
        reset();

        // reset gamemode
        gamemode = null;

        // hide form
        displayController.hideElement(domElems.gameForm);

        // hide mode select btns
        displayController.showElement(domElems.modeSelectbtns);

        // hide player 2 input
        displayController.hideElement(domElems.gameFormElems.p2Input);
        displayController.hideElement(domElems.gameFormElems.p2Label);

        // clear form
        domElems.gameForm.reset();
    };

    // start the game
    const startGame = () => {
        // reset game to starting settings
        reset();

        // get players
        players = getPlayers();

        // set current player
        currentPlayer = players.player1;

        // change text of start game button
        displayController.setTextContent(domElems.gameFormElems.startBtn, 'Restart Game');

        // hide player name inputs
        displayController.hideElement(domElems.gameFormElems.p1Input);
        displayController.hideElement(domElems.gameFormElems.p1Label);
        displayController.hideElement(domElems.gameFormElems.p2Input);
        displayController.hideElement(domElems.gameFormElems.p2Label);

        // hide back button
        displayController.hideElement(domElems.gameFormElems.backBtn);

        // set click event listener on cells that only fires once
        eventController.addEvent(
            domElems.gameBoardCells,
            'click',
            processCellClick,
            { once: true }
        );
    };

    // end the game
    const endGame = () => {
        // change text of start game button
        displayController.setTextContent(domElems.gameFormElems.startBtn, 'Start Game');

        // show player name inputs
        displayController.showElement(domElems.gameFormElems.p1Input);
        displayController.showElement(domElems.gameFormElems.p1Label);

        // show player 2 input field if gamemode is multiplayer
        if (gamemode === 'mp') {
            displayController.showElement(domElems.gameFormElems.p2Input);
            displayController.showElement(domElems.gameFormElems.p2Label);
        }

        // show back button
        displayController.showElement(domElems.gameFormElems.backBtn);

        // remove click event listener on cells
        eventController.removeEvent(
            domElems.gameBoardCells,
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
        displayController.hideElement(domElems.announcerElem);

        // remove color from winning cells
        displayController.removeClassFromElements(domElems.gameBoardCells, 'highlight');
    };

    // get players
    const getPlayers = () => {
        // create new player from factory
        const player1 = playerFactory(domElems.gameFormElems.p1Input.value, 'X');

        let player2 = null;

        // if singleplayer player2 is computer, else is a new player from factory
        if (gamemode === 'sp') {
            player2 = AIFactory('computer', 'O');
        } else {
            player2 = playerFactory(domElems.gameFormElems.p2Input.value, 'O');
        }

        return { player1, player2 };
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
        // if it is computer turn return
        if (currentPlayer.isAI) return;

        // get the click cell info
        const cell = {
            element: event.target,
            index: event.target.dataset.index
        }

        // check if cell is empty
        if (gameBoard.getValue(cell.index) === '') {
            // get the current player
            const currentPlayer = getCurrentPlayer();

            // place player mark
            gameBoard.editGameBoard(cell.index, currentPlayer.mark);

            // if no winner or draw, next turn
            if (!isWinOrDraw(currentPlayer)) {
                turn++;
                // if its singleplayer ai take a turn
                if (gamemode === 'sp') {
                    // get the AI
                    const AI = getCurrentPlayer();

                    // ai take a turn
                    AI.takeTurn(AI.mark);

                    // check if winner or draw
                    if (!isWinOrDraw(AI)) turn++;
                }
            }

        }
    };

    const isWinOrDraw = (currentPlayer) => {
        // get winner if there is one
        const winner = getWinner(currentPlayer);

        // announce if theres a winner or draw and end the game, else next round
        if (winner) {
            announce('win', winner);
            displayController.addClassToElements(winner.winningCells, 'highlight');
            endGame();
            return true;
        } else if (isDraw()) {
            announce('draw');
            endGame();
            return true;
        }
    };

    // get winning cell dom elements
    const getWinningCells = (winningCombination) => {
        return winningCombination.map(index => {
            return domElems.gameBoardCells[index];
        });
    };

    // check if there is a winnner
    const getWinner = (player) => {
        let winner = null;

        // returns true if value at index is equal to players mark
        const isEqualMark = (index) => gameBoard.getValue(index) === player.mark;

        // return a winner if player has three marks in a row
        winningCombinations.forEach(combination => {
            if (combination.every(isEqualMark)) {
                winner = {
                    player,
                    winningCells: getWinningCells(combination)
                };
            }
        });

        return winner;
    };

    // check if it is a draw
    const isDraw = () => turn === 9;

    // announce winner or draw
    const announce = (status, winner) => {
        const announcerElem = domElems.announcerElem;

        switch (status) {
            case 'win':
                displayController.setTextContent(
                    announcerElem,
                    `${winner.player.name} wins with ${winner.player.mark}'s`
                );
                break;
            case 'draw':
                displayController.setTextContent(announcerElem, 'Draw!');
                break;
            default:
                break;
        }

        // show announcer element
        displayController.showElement(announcerElem);
    };

    return { startGame, handleModeSelect, backToModeSelect };
})();

// module for creating event listeners
const eventController = (() => {
    // add event listener
    const addEvent = (target, type, listener, options) => {
        if (target instanceof Array) {
            target.forEach(element => {
                element.addEventListener(`${type}`, listener, options);
            });
        } else {
            target.addEventListener(`${type}`, listener, options);
        }
    };
    // remove event listener
    const removeEvent = (target, type, listener) => {
        if (target instanceof Array) {
            target.forEach(element => {
                element.removeEventListener(`${type}`, listener);
            });
        } else {
            target.removeEventListener(`${type}`, listener);
        }
    };

    return { addEvent, removeEvent };
})();

// add click events to ui elements
eventController.addEvent(domElems.modeSelectbtns, 'click', gameController.handleModeSelect);
eventController.addEvent(domElems.gameFormElems.startBtn, 'click', gameController.startGame);
eventController.addEvent(domElems.gameFormElems.backBtn, 'click', gameController.backToModeSelect);