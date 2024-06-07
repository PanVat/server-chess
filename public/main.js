document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    let board = null;
    const game = new Chess();
    let userColor = 'w';

    /* Objekt, který přeloží značku figurky na celé jméno */
    const pieceNames = {
        p: 'Pěšec',
        r: 'Věž',
        n: 'Jezdec',
        b: 'Střelec',
        k: 'Král',
        q: 'Dáma',
    };

    /* Nastaví barvu připojenému uživateli */
    socket.on('setColor', (color) => {
        userColor = color;
        updatePlayerTurn();
    });

    /* Přijímá aktuální stav hry ze serveru */
    socket.on('gameState', (fen) => {
        game.load(fen);
        board.position(fen);
        updatePlayerTurn();
    });

    /* Přijímá aktuální tah ze serveru */
    socket.on('move', (move) => {
        game.move(move);
        board.position(game.fen());
        updatePlayerTurn();
        displayMovePosition(move);
        checkCheckmate();
    });

    const onDragStart = (source, piece) => {
        if (game.game_over() || piece.search(userColor) === -1) return false;
    };

    const onDrop = (source, target) => {
        const move = game.move({
            from: source,
            to: target,
            promotion: 'q',
        });

        if (move === null) return 'snapback';
        socket.emit('move', move);
    };

    const onSnapEnd = () => {
        board.position(game.fen());
    };

    const boardConfig = {
        showNotation: true,
        draggable: true,
        position: 'start',
        onDragStart,
        onDrop,
        onSnapEnd,
        moveSpeed: 'fast',
        snapBackSpeed: 500,
        snapSpeed: 100,
    };

    board = Chessboard('board', boardConfig);

    /* Aktualizuje informaci o tahu hráče */
    const updatePlayerTurn = () => {
        const playerTurnElement = document.getElementById('player-turn');
        if (game.turn() === 'w') {
            playerTurnElement.innerHTML = 'Na tahu je <strong>bílý</strong> hráč';
        } else {
            playerTurnElement.innerHTML = 'Na tahu je <strong>černý</strong> hráč';
        }
    };

    /* Vypíše informaci o tahu na obrazovku */
    const displayMovePosition = (move) => {
        const playerMoveElement = document.getElementById('player-move');
        const piece = game.get(move.to);
        if (piece) {
            const pieceName = pieceNames[piece.type];
            playerMoveElement.innerHTML = `Poslední tah hráče: <strong>${pieceName}</strong> na <strong>${move.to}</strong>`;
        } else {
            playerMoveElement.innerHTML = `Poslední tah hráče: <strong>Neznámá figura</strong> na ${move.to}`;
        }
    };

    /* Otevře modální okno */
    const openModal = () => {
        const modal = document.getElementById('modal');
        modal.style.display = 'block';
    };

    /* Nastaví vítěze */
    const setWinner = (winner) => {
        const winnerElement = document.getElementById('winner');
        winnerElement.textContent = winner;
    };

    /* Funkce zobrazí hlášku o výherci */
    const checkCheckmate = () => {
        if (game.in_checkmate()) {
            let winner;
            if (game.turn() === 'w') {
                winner = 'Černý';
            } else {
                winner = 'Bílý';
            }
            setWinner(winner);
            openModal();
        }
    };
});


