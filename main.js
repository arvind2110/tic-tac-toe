const game = (function() {
    // Some messages
    const messages = {
        start : "Game Status : In Progress",
        reset : "Game Status : Yet to start!",
        draw  : "Game Status : It's a draw!"
    };

    const sounds = {
        start : 'sounds/game-start.mp3',
        success : 'sounds/game-win.mp3',
        draw : 'sounds/game-draw.mp3',
        click : 'sounds/click-sound.mp3'
    }

    // Initialize variables
    let clickCounter = 0;
    let isGameActive = false;
    let currentPlayer = 'X';
    let currentGameState = {
        gameStats : Array(9).fill(''), 
        playersGameStats: {'X' : 0, 'O' : 0, 'DRAWS' : 0}
    };

    // Select all boxes
    const boxes = document.querySelectorAll('.box');

    // Possible winning combinations for tick-tac-toe
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6] 
    ];

    // Setup initial required settings
    function setup() {
        bindEvents();
    }

    function bindEvents() {
        boxes.forEach(box => box.addEventListener('click', handleBoxClick));

        // Bind Events to Game Controls
        document.getElementById('start').addEventListener('click', startGameHandler);
        document.getElementById('reset').addEventListener('click', resetGameHandler);
        document.getElementById('reset-all').addEventListener('click', resetAllGameHandler);

        // Manage Game Operation buttons disability
        manageGameOperationButtons({start : false, reset: true, resetAll : true});
    }

    // Manage Game Operation buttons disability
    function manageGameOperationButtons(disableOptions) {
        document.getElementById('start').disabled = disableOptions.start;
        document.getElementById('reset').disabled = disableOptions.reset;
        document.getElementById('reset-all').disabled = disableOptions.resetAll;
    }

    // Start button click handler
    function startGameHandler() {
        playSound('start');
        resetSettings();
        isGameActive = true;
        displayResult(messages.start);
        
        // Manage Game Operation buttons disability
        manageGameOperationButtons({start : true, reset: false, resetAll : false});
    }

    // Reset button click handler
    function resetGameHandler() {
        playSound('start');
        resetSettings();
        boxes.forEach((box) => {
            box.textContent = '';
            box.classList.remove('win');
        });
        currentGameState.gameStats = Array(9).fill('');
        highlightSelectedPalyer();
        displayResult(messages.reset);

        // Manage Game Operation buttons disability
        manageGameOperationButtons({start : false, reset: true, resetAll : true});
    }

    // Reset All button click handler
    function resetAllGameHandler() {
        playSound('start');
        resetGameHandler();
        // Remove playes match wining data too!!!
        resetPlayersGameWins();
    }

    // Manage clicks of tick-tac-toe box clicks
    function handleBoxClick(event) {
        // Clicked Box
        const clickedBox = event.target;

        // Get the index of the clicked button
        const clickedBoxIndex = Array.from(boxes).indexOf(clickedBox);

        if (currentGameState.gameStats[clickedBoxIndex] !== '' || !isGameActive) {
            playSound('warning');
            return false;
        }

        playSound();

        // Increase click counter
        manageClickCounter(clickedBoxIndex);

        currentGameState.gameStats[clickedBoxIndex] = currentPlayer;
        clickedBox.textContent = currentPlayer;

        checkForWin();
        checkForDraw();
        switchPlayer();
    }

    // Increase click counter
    function manageClickCounter(clickedBoxIndex) {
        if (currentGameState.gameStats[clickedBoxIndex] === '') {
            clickCounter++;
        }
    }

    // Check for win
    function checkForWin() {
        // Minimum clicks requred for a win
        if (clickCounter > 4) {
            for (let i = 0; i < winningCombinations.length; i++) {
                const [a, b, c] = winningCombinations[i];
                const combination = (currentGameState.gameStats[a] + currentGameState.gameStats[b] + currentGameState.gameStats[c]);
                
                if (combination === 'XXX' || combination === 'OOO') {
                    playSound('success');
                    updatePlayersGameWins(false);
                    displayResult(`Game Status : Player ${currentPlayer} wins!`);
                    resetSettings();
                    highlightWinningBoxes(winningCombinations[i]);
                    break;
                }
            }
        }
    }

    // Check for draw
    function checkForDraw() {
        // Draw scenario must be checked after the last box click
        if (clickCounter === 9) {
            playSound('draw');
            updatePlayersGameWins(true);
            displayResult(messages.draw);
            resetSettings();
        }
    }

    // Update players winning data
    function updatePlayersGameWins(isDraw) {
        if (isDraw) {
            currentGameState.playersGameStats.DRAWS += 1;
            document.getElementById('player-draw-matches').textContent = `Draw Matches : ${currentGameState.playersGameStats.DRAWS}`;
        } else {
            if (currentPlayer === 'X') {
                currentGameState.playersGameStats.X += 1;
                document.getElementById('player-x-wins').textContent = `Player X : ${currentGameState.playersGameStats.X}`;
            } else {
                currentGameState.playersGameStats.O += 1;
                document.getElementById('player-o-wins').textContent = `Player O : ${currentGameState.playersGameStats.O}`;
            }
        }
    }

    // Reset players winning data
    function resetPlayersGameWins() {
        // Reset Data
        currentGameState.playersGameStats.DRAWS = 0;
        currentGameState.playersGameStats.X = 0;
        currentGameState.playersGameStats.O = 0;

        // Update UI
        document.getElementById('player-draw-matches').textContent = `Draw Matches : ${currentGameState.playersGameStats.DRAWS}`;
        document.getElementById('player-x-wins').textContent = `Player X : ${currentGameState.playersGameStats.X}`;
        document.getElementById('player-o-wins').textContent = `Player O : ${currentGameState.playersGameStats.O}`;
    }

    // Highlight wiinnig pattern on rick-tac-toe board
    function highlightWinningBoxes(combination) {
        combination.forEach(index => {
          boxes[index].classList.add('win');
        });
    }

    // Switch payers on each turn
    function switchPlayer() {
        currentPlayer = (currentPlayer === 'X') ? 'O' : 'X';
        highlightSelectedPalyer();
    }

    // Highlight payer based on his/her turn
    function highlightSelectedPalyer() {
        const playersConatiner = document.getElementById('palyers-list');
        const playersList = playersConatiner.querySelectorAll('li');

        playersList[0].classList.remove('border');
        playersList[1].classList.remove('border');

        if (currentPlayer === 'X') {
            playersList[0].classList.add('border');
        } else {
            playersList[1].classList.add('border');
        }
    }

    // Display game result
    function displayResult(message) {
        const result = document.querySelector('#game-result');
        result.classList.add('border');
        result.textContent = message;
    }

    // Reset most basic settings
    function resetSettings() {
        isGameActive = false;
        clickCounter = 0;
        currentPlayer = 'X';
    }

    // Play sound on different cases
    function playSound(type) {
        let soundFile = sounds.click;
        if (type === 'start') {
            soundFile = sounds.start;
        } else if (type === 'success') {
            soundFile = sounds.success;
        } else if (type === 'draw' || type === 'warning') {
            soundFile = sounds.draw;
        }
        const audio = new Audio(soundFile);
        audio.play();
    }

    return {
        init : setup
    }
})();

game.init();