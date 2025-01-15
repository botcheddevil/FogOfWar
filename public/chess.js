import { liveConnect, liveSendMove } from './websocket.js';
import { pieceSequence, gameResults } from './constants.js';

document.addEventListener('DOMContentLoaded', function () {
  // DOM Elements
  const chessboard = document.getElementById('chessboard');
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const authContainer = document.querySelector('.auth-container');
  const userInfo = document.querySelector('.user-info');
  const userDisplay = document.getElementById('userDisplay');

  const gameContainer = document.getElementById('game-container');
  const gamesList = document.getElementById('games-list');
  const backToList = document.getElementById('backToList');

  const joinGameBtn = document.getElementById('joinGameBtn');
  const newGameBtn = document.getElementById('newGameBtn');
  const gameControls = document.getElementById('game-controls');

  const storedSessionId = localStorage.getItem('sessionId');
  const storedUsername = localStorage.getItem('username');

  if (storedSessionId && storedUsername) {
    showUserInfo(storedUsername);
  }

  if (localStorage.getItem('gameId')) {
    showGameContainer(localStorage.getItem('gameId'));
    hideGameList();
    hideGameControls();
    loadGame(localStorage.getItem('gameId'));
  } else {
    loadGamesList();
    showGameList();
    showGameControls();
  }

  backToList.addEventListener('click', () => {
    loadGamesList();
    hideGameContainer();
    showGameList();
    showGameControls();
  });

  // Chess piece Unicode characters
  const pieces = {
    white: {
      king: '♔',
      queen: '♕',
      rook: '♖',
      bishop: '♗',
      knight: '♘',
      pawn: '♙',
    },
    black: {
      king: '♚',
      queen: '♛',
      rook: '♜',
      bishop: '♝',
      knight: '♞',
      pawn: '♟',
    },
  };

  // Initial piece positions
  const initialSetup = {
    // White pieces
    0: { color: 'white', type: 'rook' },
    1: { color: 'white', type: 'knight' },
    2: { color: 'white', type: 'bishop' },
    3: { color: 'white', type: 'queen' },
    4: { color: 'white', type: 'king' },
    5: { color: 'white', type: 'bishop' },
    6: { color: 'white', type: 'knight' },
    7: { color: 'white', type: 'rook' },
    // White pawns
    8: { color: 'white', type: 'pawn' },
    9: { color: 'white', type: 'pawn' },
    10: { color: 'white', type: 'pawn' },
    11: { color: 'white', type: 'pawn' },
    12: { color: 'white', type: 'pawn' },
    13: { color: 'white', type: 'pawn' },
    14: { color: 'white', type: 'pawn' },
    15: { color: 'white', type: 'pawn' },
    // Black pawns
    48: { color: 'black', type: 'pawn' },
    49: { color: 'black', type: 'pawn' },
    50: { color: 'black', type: 'pawn' },
    51: { color: 'black', type: 'pawn' },
    52: { color: 'black', type: 'pawn' },
    53: { color: 'black', type: 'pawn' },
    54: { color: 'black', type: 'pawn' },
    55: { color: 'black', type: 'pawn' },
    // Black pieces
    56: { color: 'black', type: 'rook' },
    57: { color: 'black', type: 'knight' },
    58: { color: 'black', type: 'bishop' },
    59: { color: 'black', type: 'queen' },
    60: { color: 'black', type: 'king' },
    61: { color: 'black', type: 'bishop' },
    62: { color: 'black', type: 'knight' },
    63: { color: 'black', type: 'rook' },
  };

  // Create chessboard
  function createBoard() {
    for (let i = 0; i < 64; i++) {
      const square = document.createElement('div');
      const row = Math.floor(i / 8);
      const col = i % 8;

      square.className = `square ${(row + col) % 2 === 0 ? 'square-light' : 'square-dark'}`;
      square.dataset.index = i;

      if (initialSetup[i]) {
        const piece = createPiece(initialSetup[i].color, initialSetup[i].type);
        square.appendChild(piece);
      }

      chessboard.appendChild(square);
    }
  }

  // Create chess piece
  function createPiece(color, type) {
    const piece = document.createElement('div');
    piece.className = `piece ${color}-${type}`;
    piece.innerHTML = pieces[color][type];
    piece.draggable = true;
    piece.dataset.color = color;
    piece.dataset.type = type;

    // Drag events
    piece.addEventListener('dragstart', handleDragStart);
    piece.addEventListener('dragend', handleDragEnd);

    return piece;
  }

  // Drag handlers
  let draggedPiece = null;

  function handleDragStart(e) {
    draggedPiece = e.target;
    e.target.classList.add('dragging');
    e.dataTransfer.setData('text/plain', ''); // Required for Firefox
  }

  function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    draggedPiece = null;
  }

  // Square drag events
  function initializeSquareDragEvents() {
    const squares = document.querySelectorAll('.square');
    squares.forEach((square) => {
      square.addEventListener('dragover', (e) => {
        e.preventDefault(); // Allow drop
      });

      square.addEventListener('drop', handleDrop);
    });
  }

  function handleDrop(e) {
    e.preventDefault();
    if (!draggedPiece) return;

    const square = e.target.closest('.square');
    console.log('From Square:', square.getAttribute('data-index'));
    if (!square) return;

    // If dropping on another piece, remove it
    if (e.target.classList.contains('piece')) {
      e.target.remove();
    }
    const start = draggedPiece.parentElement.getAttribute('data-index');
    // Move piece to new square
    square.appendChild(draggedPiece);

    // Here you would typically validate the move and update the game state
    //Get start index and end index

    const end = square.getAttribute('data-index');
    document.getElementById('turn').textContent = "Opponent's Turn";
    localStorage.setItem('turnOfPlayer', false);
    console.log('Move:', start, '->', end);
    const move = new Uint8Array([start, end]);
    liveSendMove(move);
  }

  function handleLogin() {
    const username = usernameInput.value;
    const password = passwordInput.value;

    // Disable buttons during API call
    loginBtn.disabled = true;
    registerBtn.disabled = true;

    fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success && data.sessionId) {
          // Store session ID
          localStorage.setItem('sessionId', data.sessionId);
          localStorage.setItem('username', username);

          showUserInfo(username);
          alert('Login successful!');
        } else {
          alert(data.error || 'Login failed');
        }
      })
      .catch((error) => {
        alert('Failed to connect to server');
        console.error('Login error:', error);
      })
      .finally(() => {
        // Re-enable buttons
        loginBtn.disabled = false;
        registerBtn.disabled = false;
        // Clear password field for security
        passwordInput.value = '';
      });
  }

  function handleRegister() {
    const username = usernameInput.value;
    const password = passwordInput.value;

    // Disable buttons during API call
    loginBtn.disabled = true;
    registerBtn.disabled = true;

    fetch('/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          showUserInfo(username);
          // Optional: Show success message
          alert('Registration successful!');
        } else {
          // Show error message if present
          alert(data.error || 'Registration failed');
        }
      })
      .catch((error) => {
        alert('Failed to connect to server');
        console.error('Registration error:', error);
      })
      .finally(() => {
        // Re-enable buttons
        loginBtn.disabled = false;
        registerBtn.disabled = false;
        // Clear password field for security
        passwordInput.value = '';
      });
  }

  function handleLogout() {
    localStorage.removeItem('sessionId');
    localStorage.removeItem('username');
    localStorage.removeItem('gameId');
    hideUserInfo();
    hideGameControls();
  }

  function handleNewGame() {
    fetch('/new-game', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'session-id': localStorage.getItem('sessionId'),
        username: localStorage.getItem('username'),
      },
      body: JSON.stringify({}),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          loadGame(data.gameId);
          console.log('Game created:', data.gameId);
        } else {
          console.error('Failed to create game:', data.error);
        }
      });
  }

  function loadGame(gameId) {
    localStorage.setItem('gameId', gameId);
    showGameContainer(gameId);
    hideGameList();
    hideGameControls();
    liveConnect(drawBoard);
  }

  function drawBoard(positions) {
    const squares = document.querySelectorAll('.square');
    squares.forEach((square) => {
      square.innerHTML = '';
    });

    for (let index = 0; index < 32; index++) {
      if (positions[index] === null) {
        continue;
      }
      const square = document.querySelector(
        `.square[data-index="${positions[index]}"]`,
      );
      const pieceElement = createPiece(
        pieceSequence[index]['color'],
        pieceSequence[index]['type'],
      );
      square.appendChild(pieceElement);
    }
    showGameContainer(localStorage.getItem('gameId'));
  }

  async function handleJoinGame() {
    const gameId = document.getElementById('gameIdInput').value.trim();

    if (!gameId) {
      alert('Please enter a game ID');
      return;
    }

    joinGame(gameId);
  }

  async function joinGame(gameId) {
    try {
      const response = await fetch('/join-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'session-id': localStorage.getItem('sessionId'),
          username: localStorage.getItem('username'),
        },
        body: JSON.stringify({ gameId }),
      });

      const data = await response.json();

      if (data.success) {
        loadGame(gameId);
      } else {
        alert(data.error || 'Failed to join game');
      }
    } catch (error) {
      console.error('Error joining game:', error);
      alert('Failed to join game');
    }
  }

  function showUserInfo(username) {
    authContainer.style.display = 'none';
    userInfo.style.display = 'flex';
    userDisplay.textContent = username;
  }

  function hideUserInfo() {
    authContainer.style.display = 'flex';
    userInfo.style.display = 'none';
    userDisplay.textContent = '';
    usernameInput.value = '';
    passwordInput.value = '';
  }

  function showGameControls() {
    gameControls.style.display = 'flex';
  }

  function hideGameControls() {
    gameControls.style.display = 'none';
  }

  function showGameContainer(gameId) {
    gameContainer.style.display = 'flex';
    document.getElementById('gameId').textContent = gameId;
    document.getElementById('opponent').textContent =
      localStorage.getItem('playerOpponent') || '';
    document.getElementById('color').textContent =
      { w: 'White', b: 'Black' }[localStorage.getItem('playerColor')] || '';
    document.getElementById('status').textContent =
      gameResults[Number(localStorage.getItem('status'))];
    document.getElementById('turn').textContent =
      localStorage.getItem('turnOfPlayer') === 'true'
        ? 'Your Turn'
        : "Opponent's Turn";
  }

  function hideGameContainer() {
    gameContainer.style.display = 'none';
  }

  function showGameList() {
    gamesList.style.display = 'block';
  }

  function hideGameList() {
    gamesList.style.display = 'none';
  }

  async function loadGamesList() {
    try {
      const response = await fetch('/games', {
        headers: {
          'session-id': localStorage.getItem('sessionId'),
          username: localStorage.getItem('username'),
        },
      });

      const data = await response.json();

      if (data.success) {
        displayGames(data.games);
      } else {
        alert('Failed to load games');
      }
    } catch (error) {
      console.error('Error loading games:', error);
      alert('Failed to load games');
    }
  }

  function displayGames(games) {
    const tbody = document.querySelector('#games-table tbody');
    tbody.innerHTML = '';

    games.forEach((game) => {
      const username = localStorage.getItem('username');
      const opponent =
        game.playerWhite === username ? game.playerBlack : game.playerWhite;

      const tr = document.createElement('tr');
      tr.innerHTML = `
            <td>${game.uuid}</td>
            <td>${opponent}</td>
            <td>${new Date(game.createdDate).toLocaleString()}</td>
            <td>${gameResults[game.result]}</td>
            <td>
                <button class="join-button" data-game-id="${game.uuid}">
                    Join Game
                </button>
            </td>
        `;

      tbody.appendChild(tr);
    });

    // Add click handlers for join buttons
    document.querySelectorAll('.join-button').forEach((button) => {
      button.addEventListener('click', async (e) => {
        const gameId = e.target.dataset.gameId;
        await loadGame(gameId);
      });
    });
  }

  // Initialize
  createBoard();
  initializeSquareDragEvents();

  // Event listeners
  loginBtn.addEventListener('click', handleLogin);
  registerBtn.addEventListener('click', handleRegister);
  logoutBtn.addEventListener('click', handleLogout);
  joinGameBtn.addEventListener('click', handleJoinGame);
  newGameBtn.addEventListener('click', handleNewGame);
});
