// factory for creating players
const playerFactory = (name, mark) => {
    return { name, mark, isAI: false };
};

// factory for creating AI
const AIFactory = (name, mark) => {
    const isAI = true;

    // return a random number between 0 and maxNumber exclusive
    const randomNumber = (maxNumber) => {
        return Math.floor(Math.random() * maxNumber);
    };

    // return a random index of a given array
    const getRandomIndex = (array) => randomNumber(array.length);

    const getCellIndexsToWinGame  = (winningCombinations, emptyCellsIndexs, markToWin) => {
        return emptyCellsIndexs.filter(emptyCellIndex => {
            // get a copy of the gameboard
            const copyOfGameBoard = gameBoard.copyGameBoard();

            // place mark in empty cell
            copyOfGameBoard[emptyCellIndex] = markToWin;

            // true if copyOfGameboard[index] is equal to markToWin
            const isEqualMark = (index) => copyOfGameBoard[index] === markToWin;

            // return true if the placed mark makes a winning combination
            return winningCombinations.some(combination => combination.every(isEqualMark));
        });
    };

    const getPossibleWinningCombinations = (winningCombinations, opponentMark) => {
        // checks if every value at a index of gameboard is equal to mark
        const isEqualMark = (index) => gameBoard.getValue(index) === opponentMark;

        // filter out winningCombinations that arent possible as opponent mark there
        const filteredCombinations = winningCombinations.filter(combination => {
            if (!combination.some(isEqualMark)) return true;
        });

        // filter out indexs that are taken by mark
        return filteredCombinations.map(combination => {
            return combination.filter(index => {
                if (gameBoard.getValue(index) !== mark) return true
            })
        });
    };

    const takeTurn = (playerMark) => {
        // get all empty cells indexs
        const emptyCellsIndexs = gameBoard.getEmptyCellsIndexs();
        // make a copy of the winning combinations
        const winningCombinations = gameController.getWinningCombinations();

        // get indexs to win game
        const indexsToWin = getCellIndexsToWinGame(winningCombinations, emptyCellsIndexs, mark);

        // get indexs to not lose game
        const indexsToNotLose = getCellIndexsToWinGame(winningCombinations, emptyCellsIndexs, playerMark);

        // get combinations that ai can win with
        const possibleWinningCombinations = getPossibleWinningCombinations(winningCombinations, playerMark);

        if (indexsToWin.length !== 0) {
            // place a mark to win the game
            gameBoard.editGameBoard(indexsToWin[getRandomIndex(indexsToWin)], mark);
        } else if (indexsToNotLose.length !== 0) {
            // place a mark to stop opponent from winning
            gameBoard.editGameBoard(indexsToNotLose[getRandomIndex(indexsToNotLose)], mark);
        } else if (possibleWinningCombinations.length !== 0) {
            const randomArrayNum = randomNumber(possibleWinningCombinations.length);
            const randomIndexNum = randomNumber(possibleWinningCombinations[randomArrayNum].length);
            // place a mark in a cell that can setup for a win
            gameBoard.editGameBoard(possibleWinningCombinations[randomArrayNum][randomIndexNum], mark);
        } else {
            // place a mark at a random cell
            gameBoard.editGameBoard(emptyCellsIndexs[getRandomIndex(emptyCellsIndexs)], mark);
        }
    };

    return {
        name,
        mark,
        isAI,
        takeTurn,
    };
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
    };

    // set all array elements to empty string
    const clearGameBoard = () => {
        _gameBoardArray.fill('');
        displayController.render();
    };

    // get empty cells indexs on gameboard
    const getEmptyCellsIndexes = () => {
        let emptyCellsIndexs = [];

        _gameBoardArray.forEach((value, index) => {
            if (value === '') emptyCellsIndexs.push(index);
        });

        return emptyCellsIndexs;
    };

    // return true if cell is empty, else false
    const isCellEmpty = (index) => _gameBoardArray[index] === '';

    // return a copy of the gameboard array
    const copyGameBoard = () => [..._gameBoardArray];

    return {
        getValue,
        editGameBoard,
        clearGameBoard,
        getEmptyCellsIndexes,
        copyGameBoard,
        isCellEmpty,
    };
})();

// module for controlling the game
const gameController = (() => {
    let players = null;
    let currentPlayer = null;
    let gamemode = null;
    let gameActive = false;

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

    // proccess the click event on a cell
    const handeCellClick = (event) => {
        // return if game not active or
        // clicked cell is not empty or
        // current player is AI
        if (
            !gameActive ||
            !gameBoard.isCellEmpty(event.target.dataset.index) ||
            currentPlayer.isAI
        ) return;

        // get the click cell index
        const cellIndex = event.target.dataset.index;

        // place current players mark in the clicked cell
        gameBoard.editGameBoard(cellIndex, currentPlayer.mark);

        // render the gameboard
        displayController.render();

        // announce if winner or draw, else next turn
        handleWinnerOrDraw();
    };

    const handleWinnerOrDraw = () => {
        // get result
        const result = getGameResult();

        // if theres a result announce it, else play next turn
        if (result !== null) {
            if (result.status.includes('win')) {
                displayController.addClassToElements(result.winner.winningCells, 'highlight');
            }
            announce(result);
            endGame();
        } else {
            nextTurn();
        }
    };

    const nextTurn = () => {
        // switch player
        switchPlayer();

        if (currentPlayer.isAI) {
            // AI play best move
            currentPlayer.bestMove();

            // render the gameboard
            displayController.render();

            // announce if winner or draw, else next turn
            handleWinnerOrDraw();
        }
    };

    // switch current player
    const switchPlayer = () => {
        currentPlayer = currentPlayer === players[0] ?
            players[1] : players[0];
    };

    // start the game
    const startGame = () => {
        // reset game to starting settings
        reset();

        // get players
        players = getPlayers();

        // set current player
        currentPlayer = players[0];

        // activate game
        gameActive = true;

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
            handeCellClick,
            { once: true }
        );
    };

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

    // end the game
    const endGame = () => {
        // stop the game
        gameActive = false;

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
            handeCellClick
        );
    };

    // reset game settings
    const reset = () => {
        // reset players and current player and turn
        players = null;
        currentPlayer = null;

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

        return [player1, player2];
    };

    const getGameResult = () => {
        let result = {};

        // get winner if there is one
        const winner = getWinner();

        // announce if theres a winner or draw and end the game, else next round
        if (winner) {
            result.winner = winner;
            result.status = `win: ${winner.mark}`;
        } else if (isDraw()) {
            result.status = 'draw';
        } else {
            return result = null;
        }

        return result;
    };

    // get winning cell dom elements
    const getWinningCells = (winningCombination) => {
        return winningCombination.map(index => {
            return domElems.gameBoardCells[index];
        });
    };

    // check if there is a winnner
    const getWinner = () => {
        let winner = null;

        const equals3 = (a, b, c) => {
            return gameBoard.getValue(a) === gameBoard.getValue(b) &&
                gameBoard.getValue(b) === gameBoard.getValue(c) &&
                gameBoard.getValue(a) !== '';
        };

        // return a winner if player has three marks in a row
        winningCombinations.forEach(combination => {
            if (equals3(combination[0], combination[1], combination[2])) {
                const winningMark = gameBoard.getValue(combination[0]);
                const winningPlayer = players.find(player => player.mark === winningMark);
                winner = winningPlayer;
                winner.winningCells = getWinningCells(combination)
            }
        });

        return winner;
    };

    // its a draw if theres no empty cells left
    const isDraw = () => gameBoard.getEmptyCellsIndexes().length === 0;

    // announce winner or draw
    const announce = (result) => {
        const announcerElem = domElems.announcerElem;

        if (result.status.includes('win')) {
            const winMessage = `${result.winner.name} wins!`;
            displayController.setTextContent(announcerElem, winMessage);
        } else {
            const drawMessage = 'Draw!';
            displayController.setTextContent(announcerElem, drawMessage);
        }

        // show announcer element
        displayController.showElement(announcerElem);
    };

    // return a copy of winningCombinations
    const getWinningCombinations = () => [...winningCombinations];

    return {
        startGame,
        handleModeSelect,
        backToModeSelect,
        getWinningCombinations,
        getWinner,
        getGameResult
    };
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