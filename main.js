const gameBoard = (() => {
    let gameBoardArray = [
        ['X', 'X', 'X'],
        ['X', 'O', 'X'],
        ['X', 'X', 'O']
    ];

    return { gameBoardArray, editGameBoard };
})();