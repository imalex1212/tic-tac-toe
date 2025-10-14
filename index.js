/********************** Game State Management ********************************/

/**
 * Central game state object that manages all game data and configuration
 */
const gameState = {
  // Game configuration settings
  selectedMark: "X", // Mark chosen by player (X or O)
  gameMode: "cpu", // Game mode: "cpu" for vs computer, "multiplayer" for vs human
  size: 3, // Board size (3x3 grid)

  // Game board and initialization
  board: [], // Array representing the game board state
  initBoard() {
    // Initialize empty board with null values (size * size cells)
    this.board = Array(this.size * this.size).fill(null);
  },

  // Turn management
  currentPlayer: "X", // Current player's turn (X always goes first)
  isActive: true, // Whether the game is currently active

  // Winner tracking
  winner: null, // Stores the winning mark (X, O, or "ties")
  playerWin: null, // Which player won (0 for player1, 1 for player2)
  lastPlayerWin: null, // Who won the last round (for turn swapping)

  initLastPlayerWin() {
    // Set initial winner based on selected mark (0 for X, 1 for O)
    this.lastPlayerWin = this.selectedMark === "X" ? 0 : 1;
  },

  // Score tracking
  scores: {
    ties: 0, // Number of tie games
    p1: 0, // Player 1 wins (you/P1)
    p2: 0, // Player 2 wins (CPU/P2)
    cpu: 0, // CPU wins (legacy, not used)
  },

  // Game reset functions
  resetRound() {
    // Reset for new round while keeping scores
    this.initBoard();
    this.isActive = true;
    this.winner = null;
    this.playerWin = null;
    this.currentPlayer = "X"; // X always starts first
  },

  quitGame() {
    // Complete game reset including scores
    this.resetRound();
    this.scores = { ties: 0, p1: 0, p2: 0, cpu: 0 };
    this.lastPlayerWin = null;
  },
};

/********************** DOM Element References ********************************/

/**
 * Object containing references to all DOM elements used in the game
 * This centralizes DOM access and makes it easier to manage UI elements
 */
const dom = {
  // Main container elements
  menu: document.getElementById("menu"), // Main menu screen
  game: document.getElementById("game"), // Game screen

  // Menu screen elements
  toggleButtons: document.getElementById("toggle-buttons"), // X/O selection buttons
  vsCpu: document.getElementById("vs-cpu"), // "New Game (vs CPU)" button
  vsPlayer: document.getElementById("vs-player"), // "New Game (vs Player)" button

  // Game screen elements
  gameBoard: document.getElementById("game-board"), // The 3x3 game grid
  turnIndicator: document.getElementById("turn"), // Shows whose turn it is
  resetBtn: document.getElementById("reset-btn"), // Reset game button

  // Score bar elements
  scoreBar: document.getElementById("score-bar"), // Score display container
  player1: document.getElementById("player-1"), // Player 1 label (YOU/P1)
  player2: document.getElementById("player-2"), // Player 2 label (CPU/P2)
  player1Mark: document.getElementById("player1-mark"), // Player 1's mark (X/O)
  player2Mark: document.getElementById("player2-mark"), // Player 2's mark (X/O)
  pointP1: document.getElementById("point-p1"), // Player 1 score display
  pointP2: document.getElementById("point-p2"), // Player 2 score display
  scoreTies: document.getElementById("point-ties"), // Ties score display
  player1Ele: document.getElementById("score-bar").firstElementChild, // Player 1 score card
  player2Ele: document.getElementById("score-bar").lastElementChild, // Player 2 score card

  // Modal elements (popup windows)
  endModal: document.getElementById("end-modal"), // Main modal container
  detailModal: document.getElementById("detail-modal"), // Game end details modal
  resetModal: document.getElementById("reset-modal"), // Reset confirmation modal

  // Modal content elements
  winTitle: document.getElementById("win-title"), // "YOU WON!" / "YOU LOST!" text
  roundModal: document.getElementById("round-modal"), // Round result modal
  roundIcon: document.getElementById("round-icon"), // Winner's mark icon
  roundTitLe: document.getElementById("round-title"), // Round title text
  roundTies: document.getElementById("round-ties"), // Tie game display

  // Modal action buttons
  quitBtn: document.getElementById("quit-btn"), // Quit to main menu button
  nextRoundBtn: document.getElementById("nextRound-btn"), // Continue to next round button
  cancelBtn: document.getElementById("cancel-btn"), // Cancel reset button
  resetStart: document.getElementById("restart-btn"), // Confirm reset button
};

/********************** Game Constants ********************************/

/**
 * Game mark constants for X and O
 */
const marks = {
  X: "X",
  O: "O",
};

/**
 * SVG icons for X and O marks displayed in the game
 */
const icons = {
  X: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" class="w-5 h-5 text-[#A8BFC9]"><path d="M15.002 1.147 32 18.145 48.998 1.147a3 3 0 0 1 4.243 0l9.612 9.612a3 3 0 0 1 0 4.243L45.855 32l16.998 16.998a3 3 0 0 1 0 4.243l-9.612 9.612a3 3 0 0 1-4.243 0L32 45.855 15.002 62.853a3 3 0 0 1-4.243 0L1.147 53.24a3 3 0 0 1 0-4.243L18.145 32 1.147 15.002a3 3 0 0 1 0-4.243l9.612-9.612a3 3 0 0 1 4.243 0Z" fill="currentColor" fill-rule="evenodd"/></svg>',
  O: '<svg viewBox="0 0 64 64" class="w-5 h-5 text-[#A8BFC9]" xmlns="http://www.w3.org/2000/svg"><path d="M32 0c17.673 0 32 14.327 32 32 0 17.673-14.327 32-32 32C14.327 64 0 49.673 0 32 0 14.327 14.327 0 32 0Zm0 18.963c-7.2 0-13.037 5.837-13.037 13.037 0 7.2 5.837 13.037 13.037 13.037 7.2 0 13.037-5.837 13.037-13.037 0-7.2-5.837-13.037-13.037-13.037Z" fill="currentColor"/></svg>',
};

/**
 * Color scheme for X and O marks
 */
const colors = {
  X: "#31C3BD", // Teal color for X
  O: "#F2B137", // Orange color for O
};

/********************** Utility Functions ********************************/

/**
 * Collection of utility functions used throughout the game
 */
const utility = {
  /**
   * Generates all possible winning combinations for the game board
   * @returns {Array} Array of winning combinations (rows, columns, diagonals)
   */
  generateWinningCombo() {
    const { size } = gameState;
    const combos = [];

    // Generate row combinations (horizontal wins)
    for (let r = 0; r < size; r++) {
      const rows = [];
      for (let i = 0; i < size; i++) {
        rows.push(r * size + i); // Convert 2D position to 1D array index
      }
      combos.push(rows);
    }

    // Generate column combinations (vertical wins)
    for (let c = 0; c < size; c++) {
      const columns = [];
      for (let i = 0; i < size; i++) {
        columns.push(i * size + c); // Convert 2D position to 1D array index
      }
      combos.push(columns);
    }

    // Generate diagonal combinations
    const diag1 = []; // Top-left to bottom-right diagonal
    const diag2 = []; // Top-right to bottom-left diagonal
    for (let d = 0; d < size; d++) {
      diag1.push(d * (size + 1)); // Main diagonal (0, 4, 8 for 3x3)
      diag2.push((d + 1) * (size - 1)); // Anti-diagonal (2, 4, 6 for 3x3)
    }
    combos.push(diag1, diag2);

    return combos;
  },

  /**
   * Finds all empty cells on the board
   * @param {Array} board - The game board array
   * @returns {Array} Array of indices of empty cells
   */
  findEmptyCells(board) {
    return board
      .map((cell, cellIndex) => (cell === null ? cellIndex : null)) // Map empty cells to their index
      .filter((val) => val !== null); // Filter out non-empty cells
  },

  /**
   * Generates a simple combination array (legacy function, not actively used)
   * @returns {Array} Array of consecutive numbers from 0 to size-1
   */
  generateCombo() {
    const combo = [];
    for (let j = 0; j < gameState.size; j++) {
      combo.push(j);
    }
    return combo;
  },
};

/****************************************************** Game Logic ********************************/

/**
 * Core game logic functions that handle game rules and state changes
 */
const gameLogic = {
  /**
   * Checks if there's a winner on the current board
   * @returns {string|null} - Winner mark (X or O) or null if no winner
   */
  checkWinner() {
    const combos = utility.generateWinningCombo();

    // Check each winning combination
    for (let combo of combos) {
      const firstValue = gameState.board[combo[0]]; // Get the first cell in the combo

      // If first cell is not empty and all cells in combo match
      if (
        firstValue &&
        combo.every((position) => gameState.board[position] === firstValue)
      ) {
        return firstValue; // Found a winner!
      }
    }
    return null; // No winner found
  },

  /**
   * Checks if the game is a tie (board is full with no winner)
   * @returns {boolean} True if it's a tie, false otherwise
   */
  checkTies() {
    return gameState.board.every((cell) => cell !== null); // All cells filled
  },

  /**
   * Makes a move on the board and handles game state updates
   * @param {number} cellIndex - Index of the cell to place the mark
   * @returns {boolean} True if game ended (win/tie), false if game continues
   */
  makeMove(cellIndex) {
    // Place the current player's mark on the board
    gameState.board[cellIndex] = gameState.currentPlayer;
    UI.updateCellUI(cellIndex, gameState.currentPlayer);

    // Check for winner
    gameState.winner = this.checkWinner();
    if (this.checkWinner()) {
      gameState.isActive = false;
      scoreManage.updateScore(gameState.winner); // Update score for winner
      endModal.showEndModal("win");
      return true; // Game ended with a winner
    }

    // Check for tie
    if (this.checkTies()) {
      console.log("ties");
      gameState.winner = "ties";
      gameState.isActive = false;
      scoreManage.increaseTies(); // Update tie score
      endModal.showEndModal("ties");
      return true; // Game ended with a tie
    }

    // Switch to the other player's turn
    gameState.currentPlayer = gameState.currentPlayer === "X" ? "O" : "X";
    UI.updateTurnIndicator();

    return false; // Game continues
  },

  /**
   * Generates a random cell index for CPU move
   * @returns {number} Random index of an empty cell
   */
  CpuCellIndex() {
    const emptyCells = utility.findEmptyCells(gameState.board);
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  },

  /**
   * Determines which player won based on the winning mark
   * @param {string} winner - The winning mark (X or O)
   * @returns {number|undefined} Player number (0 or 1) or undefined for ties
   */
  getPlayerWin(winner) {
    if (winner === "ties") return; // No player wins in a tie

    if (winner === dom.player1Mark.textContent) {
      return (gameState.playerWin = 0); // Player 1 wins
    } else {
      return (gameState.playerWin = 1); // Player 2 wins
    }
  },
};

/********************************************** Player Management ******************************************************/

/**
 * Manages player-related functionality including labels, turns, and player types
 */
const playerManage = {
  /**
   * Updates player labels and visual styling based on game mode and selected marks
   */
  updateLabel() {
    const { gameMode, selectedMark } = gameState;

    // Set player names based on game mode
    dom.player1.textContent = gameMode === "cpu" ? "YOU" : "P1";
    dom.player2.textContent = gameMode === "cpu" ? "CPU" : "P2";

    // Determine if player 1 has X mark
    const isPlayer1X = selectedMark === "X";

    // Set marks for each player
    dom.player1Mark.textContent = isPlayer1X ? "X" : "O";
    dom.player2Mark.textContent = isPlayer1X ? "O" : "X";

    // Set background colors for score cards based on marks
    dom.player1Ele.style.backgroundColor = isPlayer1X ? colors.X : colors.O;
    dom.player2Ele.style.backgroundColor = isPlayer1X ? colors.O : colors.X;
  },

  /**
   * Determines if it's currently the human player's turn (only relevant in CPU mode)
   * @returns {boolean} True if it's human's turn, false if it's CPU's turn
   */
  isHumanTurn() {
    if (gameState.gameMode !== "cpu") return true; // In multiplayer, always human turn
    return gameState.currentPlayer === gameState.selectedMark; // Check if current player matches human's mark
  },
};

/********************************************** Score Management ************************************************* */

/**
 * Handles all score-related functionality including tracking wins, ties, and display updates
 */
const scoreManage = {
  /**
   * Updates the score based on the winner and refreshes the display
   * @param {string} winner - The winning mark (X or O)
   */
  updateScore(winner) {
    const { scores } = gameState;

    // Determine which player won and increment their score
    if (winner === dom.player1Mark.textContent) {
      scores.p1++; // Player 1 wins
    } else if (winner === dom.player2Mark.textContent) {
      scores.p2++; // Player 2 wins
    }
    // Note: Ties are handled separately in increaseTies()

    this.updateDisplay(); // Refresh the score display
  },

  /**
   * Increments the tie count and updates the display
   */
  increaseTies() {
    gameState.scores.ties++;
    this.updateDisplay();
  },

  /**
   * Updates the visual display of all scores on the UI
   */
  updateDisplay() {
    const { scores } = gameState;

    // Update tie score display
    dom.scoreTies.textContent = scores.ties;

    // Update player scores (always show p1 and p2 scores in order)
    dom.pointP1.textContent = scores.p1;
    dom.pointP2.textContent = scores.p2;
  },

  /**
   * Resets all scores to zero and updates the display
   */
  reset() {
    gameState.quitGame(); // Reset the entire game state
    this.updateDisplay(); // Update the display to show zeros
  },
};

/********************************************** UI Management ************************************************* */

/**
 * Handles all user interface updates and visual elements
 */
const UI = {
  /**
   * Creates and displays the game board with clickable cells
   */
  createBoard() {
    const { size } = gameState;

    // Clear any existing board content
    dom.gameBoard.innerHTML = "";

    // Set up CSS grid classes for the board layout
    dom.gameBoard.className = `grid grid-cols-${size} aspect-square gap-[${
      40 / (size - 1)
    }px] my-8`;

    // Create individual cells for the board
    for (let i = 0; i < size * size; i++) {
      const cell = document.createElement("button");
      cell.dataset.cell = i; // Store cell index for identification
      cell.className =
        "box-primary w-full aspect-square h-full flex items-center justify-center min-h-0 min-w-0";

      // Add click event listener for each cell
      cell.addEventListener("click", () => gameControler.handleCellClick(i));
      cell.addEventListener("mouseenter", () => {
        if (!cell.innerHTML) {
          cell.style.backgroundImage = `url('assets/icon-${gameState.currentPlayer}-outline.svg')`;
          cell.style.backgroundSize = "50%";
          cell.style.backgroundRepeat = "no-repeat";
          cell.style.backgroundPosition = "center";
        }
      });
      cell.addEventListener("mouseleave", () => {
        if (!cell.innerHTML) {
          cell.style.backgroundImage = "";
        }
      });
      dom.gameBoard.appendChild(cell);
    }
  },

  /**
   * Updates a specific cell's visual appearance with the player's mark
   * @param {number} cellIndex - Index of the cell to update
   * @param {string} mark - Player's mark (X or O)
   */
  updateCellUI(cellIndex, mark) {
    const cell = document.querySelector(`[data-cell="${cellIndex}"]`);
    const icon = mark === "X" ? "icon-x" : "icon-o";
    cell.innerHTML = `<img src="./assets/${icon}.svg" alt="${icon}">`;
    cell.style.backgroundImage = "";
  },

  /**
   * Updates the turn indicator to show whose turn it is
   */
  updateTurnIndicator() {
    dom.turnIndicator.innerHTML = icons[gameState.currentPlayer];
  },

  /**
   * Shows the game screen and hides the menu
   */
  showGame() {
    dom.game.style.display = "block";
    dom.menu.style.display = "none";
  },

  /**
   * Shows the menu screen and hides the game
   */
  showMenu() {
    dom.menu.style.display = "block";
    dom.game.style.display = "none";
  },

  /**
   * Updates the X/O toggle button visual state
   * @param {number} buttonIndex - Index of the selected button (0 for X, 1 for O)
   */
  updateToggleMark(buttonIndex) {
    const toggleSlider = document.getElementById("toggle-slider");
    const buttons = dom.toggleButtons.querySelectorAll("button");
    const isX = buttonIndex === 0;

    // Move the toggle slider
    toggleSlider.classList.toggle("translate-x-0", isX);
    toggleSlider.classList.toggle("translate-x-full", !isX);

    // Update button colors to show selection
    buttons[0].querySelector("svg").classList.toggle("text-[#1A2A33]", isX);
    buttons[0].querySelector("svg").classList.toggle("text-[#A8BFC9]", !isX);
    buttons[1].querySelector("svg").classList.toggle("text-[#1A2A33]", !isX);
    buttons[1].querySelector("svg").classList.toggle("text-[#A8BFC9]", isX);
  },
};

/********************************************** Modal Management ************************************************* */

/**
 * Manages all modal (popup) windows and their content
 */
const endModal = {
  /**
   * Shows the end game modal with appropriate content
   * @param {string} type - Type of game end ("win" or "ties")
   * @param {string|null} winner - Winner mark (optional, defaults to null)
   */
  showEndModal(type, winner = null) {
    // Show the main modal and hide others
    dom.endModal.classList.remove("hidden");
    dom.resetModal.classList.add("hidden");
    dom.detailModal.classList.remove("hidden");

    // Clear any previous modal content
    this.clearModal();

    // Display appropriate content based on game result
    if (type === "win") {
      this.displayWinner();
    } else if (type === "ties") {
      this.displayTies();
    }
  },

  /**
   * Displays winner information in the modal
   */
  displayWinner() {
    const { winner } = gameState;

    // Show the winner's icon
    const icon = winner === "X" ? "icon-x" : "icon-o";
    dom.roundIcon.innerHTML = `<img src="./assets/${icon}.svg" alt="${icon}">`;
    dom.roundTitLe.style.color = colors[winner]; // Color the title with winner's color

    // Determine the correct winner message
    const isYOU = dom.player1Mark.textContent === "X";
    const playerWon = (winner === "X" && isYOU) || (winner === "O" && !isYOU);

    if (gameState.gameMode === "cpu") {
      // CPU mode: Show YOU WON or YOU LOST
      dom.winTitle.textContent = playerWon ? "YOU WON!" : "OH, NO YOU LOST...";
    } else {
      // Multiplayer mode: Show which player won
      dom.winTitle.textContent = playerWon
        ? "PLAYER 1 WINS!"
        : "PLAYER 2 WINS!";
    }
  },

  /**
   * Displays tie game information in the modal
   */
  displayTies() {
    // Hide winner-specific elements and show tie message
    dom.winTitle.classList.add("hidden");
    dom.roundIcon.classList.add("hidden");
    dom.roundTitLe.classList.add("hidden");
    dom.roundTies.classList.remove("hidden");
  },

  /**
   * Clears all modal content and resets to default state
   */
  clearModal() {
    // Reset all modal elements to their default state
    dom.winTitle.classList.remove("hidden");
    dom.winTitle.textContent = "";
    dom.roundTitLe.classList.remove("hidden");
    dom.roundTitLe.style.color = "";
    dom.roundTies.classList.add("hidden");
    dom.roundIcon.innerHTML = "";
  },

  /**
   * Shows the reset confirmation modal
   */
  showResetConfirm() {
    dom.endModal.classList.remove("hidden");
    dom.resetModal.classList.remove("hidden");
    dom.detailModal.classList.add("hidden");
  },

  /**
   * Hides all modals
   */
  hideAll() {
    dom.endModal.classList.add("hidden");
  },
};

/********************************************** Game Controller ************************************************* */

/**
 * Main game controller that handles user interactions and game flow
 */
const gameControler = {
  /**
   * Handles X/O mark selection from the toggle buttons
   * @param {number} buttonIndex - Index of the selected button (0 for X, 1 for O)
   */
  handleSelectMark(buttonIndex) {
    gameState.selectedMark = buttonIndex === 0 ? "X" : "O";
    UI.updateToggleMark(buttonIndex);
  },

  /**
   * Starts a new game with the specified mode
   * @param {string} mode - Game mode ("cpu" or "multiplayer")
   */
  startGame(mode) {
    gameState.gameMode = mode;
    console.log(gameState.selectedMark);

    // Initialize game state for new game
    gameState.initLastPlayerWin();
    gameState.initBoard();

    // Set up the UI for gameplay
    UI.showGame();
    UI.createBoard();
    playerManage.updateLabel();
    UI.updateTurnIndicator();

    // In CPU mode, if player selected O, CPU (X) moves first
    if (mode === "cpu" && gameState.selectedMark === "O") {
      this.executeCpuMove();
    }
  },

  /**
   * Handles cell click events on the game board
   * @param {number} cellIndex - Index of the clicked cell
   */
  handleCellClick(cellIndex) {
    // Validate move: game must be active and cell must be empty
    if (!gameState.isActive || gameState.board[cellIndex] !== null) return;

    gameState;
    // Route to appropriate handler based on game mode
    if (gameState.gameMode === "cpu") {
      this.handleCPUMove(cellIndex);
    } else {
      this.handleMultiplayerMove(cellIndex);
    }
  },

  /**
   * Handles moves in multiplayer mode (human vs human)
   * @param {number} cellIndex - Index of the clicked cell
   */
  handleMultiplayerMove(cellIndex) {
    gameLogic.makeMove(cellIndex);
  },

  /**
   * Handles moves in CPU mode (human vs computer)
   * @param {number} cellIndex - Index of the clicked cell
   */
  handleCPUMove(cellIndex) {
    // Only process move if it's the human player's turn
    if (!playerManage.isHumanTurn()) return;

    console.log("selected" + gameState.selectedMark);
    console.log("current" + gameState.currentPlayer);

    // Make the human move
    if (gameLogic.makeMove(cellIndex)) return; // Game ended, don't continue

    // If game continues and it's now CPU's turn, make CPU move
    if (gameState.selectedMark !== gameState.currentPlayer) {
      console.log("CPU turn");
      this.executeCpuMove();
    }
  },

  /**
   * Executes a CPU move with a delay for better UX
   */
  executeCpuMove() {
    // Don't move if no empty cells remain
    if (utility.findEmptyCells(gameState.board).length === 0) return;

    // Add delay to make CPU move feel more natural
    setTimeout(() => {
      if (gameState.isActive) {
        const indexCellCPU = gameLogic.CpuCellIndex();
        gameLogic.makeMove(indexCellCPU);
      }
    }, 500);
  },

  /**
   * Shows the reset confirmation modal
   */
  resetGame() {
    endModal.showResetConfirm();
  },

  /**
   * Proceeds to the next round after a game ends
   */
  nextRound() {
    console.log("Starting next round");
    dom.endModal.classList.add("hidden");

    // Determine who won this round
    gameState.playerWin = gameLogic.getPlayerWin(gameState.winner);

    // Winner goes first in next round (swap marks if winner changed)
    if (
      gameState.playerWin !== gameState.lastPlayerWin &&
      gameState.winner !== "ties"
    ) {
      gameState.selectedMark = gameState.selectedMark === "X" ? "O" : "X";
    }

    // Set up new round
    UI.createBoard();
    playerManage.updateLabel();
    UI.updateTurnIndicator();

    gameState.lastPlayerWin = gameState.playerWin;
    gameState.resetRound();

    // If CPU should go first in new round, execute CPU move
    if (gameState.gameMode === "cpu" && gameState.selectedMark === "O") {
      gameControler.executeCpuMove();
    }
  },

  /**
   * Quits the current game and returns to main menu
   */
  quitGame() {
    scoreManage.reset(); // Reset all scores
    endModal.hideAll(); // Hide any open modals
    UI.showMenu(); // Return to main menu
  },

  /**
   * Cancels the reset confirmation
   */
  cancelReset() {
    endModal.hideAll();
  },

  /**
   * Confirms reset and starts a fresh round
   */
  resetStart() {
    dom.endModal.classList.add("hidden");
    UI.createBoard();
    playerManage.updateLabel();
    UI.updateTurnIndicator();
    gameState.resetRound();
  },
};

// =======================================
// ============== EVENT LISTENERS ===============
// =======================================

/**
 * Initializes all event listeners for the game
 * This function sets up all the click handlers and user interactions
 */
function initializeEventListeners() {
  // X/O toggle buttons in the main menu
  const toggleBtns = dom.toggleButtons.querySelectorAll("button");
  toggleBtns.forEach((btn, index) =>
    btn.addEventListener("click", () => gameControler.handleSelectMark(index))
  );

  // Game mode selection buttons
  dom.vsCpu.addEventListener("click", () => gameControler.startGame("cpu"));
  dom.vsPlayer.addEventListener("click", () =>
    gameControler.startGame("multiplayer")
  );

  // In-game control buttons
  dom.resetBtn.addEventListener("click", () => gameControler.resetGame());

  // End game modal buttons
  dom.quitBtn.addEventListener("click", () => gameControler.quitGame());
  dom.nextRoundBtn.addEventListener("click", () => gameControler.nextRound());

  // Reset confirmation modal buttons
  dom.cancelBtn.addEventListener("click", () => gameControler.cancelReset());
  dom.resetStart.addEventListener("click", () => gameControler.resetStart());
}

/**
 * Initialize the game when the DOM is fully loaded
 */
document.addEventListener("DOMContentLoaded", () => {
  initializeEventListeners();
});
