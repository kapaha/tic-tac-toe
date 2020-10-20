// factory for creating players
const playerFactory = (name, mark) => {
    return { name, mark, isAI: false };
};

// factory for creating AI
const AIFactory = (name, mark, difficulty, opponentMark) => {
    // make a move based on difficulty
    const makeMove = () => {
        switch (difficulty) {
            case 'easy':
                // 30% chance to play best move instead of random move
                _chanceBestMove(30);
                break;
            case 'medium':
                // 50% chance to play best move instead of random move
                _chanceBestMove(50);
                break;
            case 'impossible':
                _bestMove();
                break;
            default:
                break;
        }

        // render the gameboard
        displayController.render();
    };

    // place a best move based on chance else play a random move
    const _chanceBestMove = (chance) => {
        // get a random number between 0 and 100 exclusive
        const randomNumber = Math.random() * 100;

        // if randomNumber is below chance, best move is played
        if (randomNumber < chance) {
            _bestMove();
        } else {
            _randomMove();
        }
    };

    // play a random possible move
    const _randomMove = () => {
        // get all available postions to place a mark
        const availablePositions = gameBoard.getEmptyCellsIndexes();

        // get a random available position
        const randomAvailablePosition = gameController.getRandomArrayElement(availablePositions);

        // place mark at a random available position
        gameBoard.editGameBoard(randomAvailablePosition, mark);
    };

    // play the best possible move
    const _bestMove = () => {
        // get all available postions to place a mark
        const availablePositions = gameBoard.getEmptyCellsIndexes();

        let bestScore = -Infinity;
        let move;

        // iterate over available positions
        availablePositions.forEach(index => {
            // place a mark at available position
            gameBoard.editGameBoard(index, mark);

            // get the score of the new gameboard with the above position marked
            let score = _minimax(false);

            // remove mark from gameboard
            gameBoard.editGameBoard(index, '');

            // if this move has a higher score than the current bestScore
            // set the bestScore to this score and set the move to the index
            if (score > bestScore) {
                bestScore = score;
                move = index;
            };
        });

        // make the best move
        gameBoard.editGameBoard(move, mark);
    };

    // returns best score of all possible moves of the game
    const _minimax = (isMaximizing) => {
        // get the result of the game
        const result = gameController.getGameResult();

        // return a score if the game is over
        if (result !== null) {
            // scores based on the AI's mark
            const scores = {
                'win: X': mark === 'X' ? 10 : -10,
                'win: O': mark === 'O' ? 10 : -10,
                draw: 0,
            };
            return scores[result.status];
        }

        // get all available postions to place a mark
        const availablePositions = gameBoard.getEmptyCellsIndexes();

        // if the move is the maximizing player
        if (isMaximizing) {
            let bestScore = -Infinity;

            // iterate over available positions
            availablePositions.forEach(index => {
                // place a mark at available position
                gameBoard.editGameBoard(index, mark);

                // get the score of the new gameboard with the above position marked
                let score = _minimax(false);

                // remove mark from gameboard
                gameBoard.editGameBoard(index, '');

                // update bestScore to equal score if score is higher than bestscore
                bestScore = Math.max(score, bestScore);
            });

            return bestScore;
        } else {
            let bestScore = Infinity;

            // iterate over available positions
            availablePositions.forEach(index => {
                // place a mark at available position
                gameBoard.editGameBoard(index, opponentMark);

                // get the score of the new gameboard with the above position marked
                let score = _minimax(true);

                // remove mark from gameboard
                gameBoard.editGameBoard(index, '');

                // update bestScore to equal score if score is lower than bestscore
                bestScore = Math.min(score, bestScore);
            });

            return bestScore;
        }
    };

    return {
        name,
        mark,
        isAI: true,
        makeMove,
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
    const formGrid = document.querySelector('.form-grid');

    return {
        gameBoardCells,
        announcerElem,
        modeSelectbtns,
        gameForm,
        gameFormElems,
        formGrid
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

    // show who's turn it is
    const showCurrentPlayer = (currentPlayer) => {
        const text = `${currentPlayer.name}'s Turn - ${currentPlayer.mark}`;
        setTextContent(domElems.announcerElem, text);
    }

    return {
        render,
        setTextContent,
        showElement,
        hideElement,
        addClassToElements,
        removeClassFromElements,
        showCurrentPlayer
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

    return {
        getValue,
        editGameBoard,
        clearGameBoard,
        getEmptyCellsIndexes,
        isCellEmpty,
    };
})();

// module for controlling the game
const gameController = (() => {
    const _marks = ['X', 'O'];

    let _players = null;
    let _currentPlayer = null;
    let _gamemode = null;
    let _gameActive = false;
    let _difficulty = null;

    // all possible winning combinations (lines)
    const _winningCombinations = [
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
    const _handeCellClick = (event) => {
        // return if game not active or
        // clicked cell is not empty or
        // current player is AI
        if (
            !_gameActive ||
            !gameBoard.isCellEmpty(event.target.dataset.index) ||
            _currentPlayer.isAI
        ) return;

        // get the click cell index
        const cellIndex = event.target.dataset.index;

        // place current players mark in the clicked cell
        gameBoard.editGameBoard(cellIndex, _currentPlayer.mark);

        // render the gameboard
        displayController.render();

        // announce if winner or draw, else next turn
        _handleWinnerOrDraw();
    };

    const _handleWinnerOrDraw = () => {
        // get result
        const result = getGameResult();

        // if theres a result announce it and end the game, else play next turn
        if (result !== null) {
            if (result.status.includes('win')) {
                displayController.addClassToElements(result.winner.winningCells, 'highlight');
            }
            _announce(result);
            _endGame();
        } else {
            _nextTurn();
        }
    };

    const _nextTurn = () => {
        _switchPlayer();

        // show who's turn it is
        displayController.showCurrentPlayer(_currentPlayer);

        // if AI is current player AI take turn
        _handleAITurn();
    };

    // switch current player
    const _switchPlayer = () => {
        _currentPlayer = _currentPlayer === _players[0] ?
            _players[1] : _players[0];
    };

    // end the game
    const _endGame = () => {
        // stop the game
        _gameActive = false;

        // change form back to grid
        domElems.formGrid.style.display = 'grid';

        // change text of start game button
        displayController.setTextContent(domElems.gameFormElems.startBtn, 'Start Game');

        // show player name inputs
        displayController.showElement(domElems.gameFormElems.p1Label);

        // show player 2 input field if gamemode is multiplayer
        if (_gamemode === 'mp') {
            displayController.showElement(domElems.gameFormElems.p2Label);
        }

        // show back button
        displayController.showElement(domElems.gameFormElems.backBtn);

        // remove click event listener on cells
        eventController.removeEvent(
            domElems.gameBoardCells,
            'click',
            _handeCellClick
        );
    };

    // reset game settings
    const _reset = () => {
        // reset players and current player and turn
        _players = null;
        _currentPlayer = null;

        // reset gameboard
        gameBoard.clearGameBoard();

        // hide announcement msg
        displayController.hideElement(domElems.announcerElem);

        // remove color from winning cells
        displayController.removeClassFromElements(domElems.gameBoardCells, 'highlight');
    };

    // get players
    const _getPlayers = () => {
        // get player names from text inputs
        const player1Name = domElems.gameFormElems.p1Input.value || 'player1';
        const player2Name = domElems.gameFormElems.p2Input.value || 'player2';

        // get random mark for each player
        const player1Mark = getRandomArrayElement(_marks);
        const player2Mark = player1Mark === 'X' ? 'O' : 'X';

        // create new player from factory
        const player1 = playerFactory(player1Name, player1Mark);

        // if singleplayer player2 is computer, else is a new player from factory
        let player2 = null;
        if (_gamemode === 'sp') {
            player2 = AIFactory('computer', player2Mark, _difficulty, player1Mark);
        } else {
            player2 = playerFactory(player2Name, player2Mark);
        }

        return [player1, player2];
    };

    // get winning cell dom elements
    const _getWinningCells = (winningCombination) => {
        return winningCombination.map(index => {
            return domElems.gameBoardCells[index];
        });
    };

    // check if there is a winnner
    const _getWinner = () => {
        let winner = null;

        const equals3 = (a, b, c) => {
            return gameBoard.getValue(a) === gameBoard.getValue(b) &&
                gameBoard.getValue(b) === gameBoard.getValue(c) &&
                gameBoard.getValue(a) !== '';
        };

        // return a winner if player has three marks in a row
        _winningCombinations.forEach(combination => {
            if (equals3(combination[0], combination[1], combination[2])) {
                const winningMark = gameBoard.getValue(combination[0]);
                const winningPlayer = _players.find(player => player.mark === winningMark);
                winner = winningPlayer;
                winner.winningCells = _getWinningCells(combination)
            }
        });

        return winner;
    };

    // its a draw if theres no empty cells left
    const _isDraw = () => gameBoard.getEmptyCellsIndexes().length === 0;

    // announce winner or draw
    const _announce = (result) => {
        const announcerElem = domElems.announcerElem;

        if (result.status.includes('win')) {
            const winMessage = `${result.winner.name} wins with ${result.winner.mark}s!`;
            displayController.setTextContent(announcerElem, winMessage);
        } else {
            const drawMessage = 'Draw!';
            displayController.setTextContent(announcerElem, drawMessage);
        }
    };

    const _handleAITurn = () => {
        const aiMoveTimer = 1000;

        if (_currentPlayer.isAI) {
            setTimeout(() => {
                // AI make a move
                _currentPlayer.makeMove();

                // announce if winner or draw, else next turn
                _handleWinnerOrDraw();
            }, aiMoveTimer);
        }
    };

    // start the game
    const startGame = () => {
        // reset game to starting settings
        _reset();

        // get players
        _players = _getPlayers();

        // get a random starting player
        _currentPlayer = getRandomArrayElement(_players);

        // activate game
        _gameActive = true;

        // change text of start game button
        displayController.setTextContent(domElems.gameFormElems.startBtn, 'Restart Game');

        // hide player name inputs
        displayController.hideElement(domElems.gameFormElems.p1Label);
        displayController.hideElement(domElems.gameFormElems.p2Label);

        // remove grid
        domElems.formGrid.style.display = 'block';

        // hide back button
        displayController.hideElement(domElems.gameFormElems.backBtn);

        // show who's turn it is
        displayController.showCurrentPlayer(_currentPlayer);

        // show announcer element
        displayController.showElement(domElems.announcerElem);

        // set click event listener on cells that only fires once
        eventController.addEvent(
            domElems.gameBoardCells,
            'click',
            _handeCellClick
        );

        // if AI is current player AI take turn
        _handleAITurn();
    };

    const handleModeSelect = (event) => {
        // set gamemode
        _gamemode = event.target.dataset.mode;

        // show player 2 input field if gamemode is multiplayer
        if (_gamemode === 'mp') {
            displayController.showElement(domElems.gameFormElems.p2Input);
            displayController.showElement(domElems.gameFormElems.p2Label);
        } else {
            // set difficulty
            _difficulty = event.target.dataset.difficulty;
        }

        // hide mode select btns
        displayController.hideElement(domElems.modeSelectbtns);

        // show form
        displayController.showElement(domElems.gameForm);
    };

    const backToModeSelect = () => {
        // reset game settings
        _reset();

        // reset gamemode
        _gamemode = null;

        // hide form
        displayController.hideElement(domElems.gameForm);

        // hide mode select btns
        displayController.showElement(domElems.modeSelectbtns);

        // hide player 2 input
        displayController.hideElement(domElems.gameFormElems.p2Input);
        displayController.hideElement(domElems.gameFormElems.p2Label);
    };

    const getGameResult = () => {
        let result = {};

        // get winner if there is one
        const winner = _getWinner();

        // announce if theres a winner or draw and end the game, else next round
        if (winner) {
            result.winner = winner;
            result.status = `win: ${winner.mark}`;
        } else if (_isDraw()) {
            result.status = 'draw';
        } else {
            return result = null;
        }

        return result;
    };

    // return a random array element
    const getRandomArrayElement = (array) => {
        return array[Math.floor(Math.random() * array.length)];
    };

    return {
        startGame,
        handleModeSelect,
        backToModeSelect,
        getGameResult,
        getRandomArrayElement
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

// add click events to UI elements
eventController.addEvent(domElems.modeSelectbtns, 'click', gameController.handleModeSelect);
eventController.addEvent(domElems.gameFormElems.startBtn, 'click', gameController.startGame);
eventController.addEvent(domElems.gameFormElems.backBtn, 'click', gameController.backToModeSelect);