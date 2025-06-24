const canvas = document.getElementById("chessboard");
const ctx = canvas.getContext("2d");
const startMenu = document.getElementById("startMenu");
const pauseMenu = document.getElementById("pauseMenu");
const gameUI = document.getElementById("gameUI");
const statusText = document.getElementById("statusText");

const tileSize = 60;
let board = [];
let selected = null;
let playerColor = 'white';
let gameMode = '';

const pieces = {
  r: { w: '♖', b: '♜' },
  n: { w: '♘', b: '♞' },
  b: { w: '♗', b: '♝' },
  q: { w: '♕', b: '♛' },
  k: { w: '♔', b: '♚' },
  p: { w: '♙', b: '♟' }
};

const initBoard = () => [
  ["b_r", "b_n", "b_b", "b_q", "b_k", "b_b", "b_n", "b_r"],
  ["b_p", "b_p", "b_p", "b_p", "b_p", "b_p", "b_p", "b_p"],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["w_p", "w_p", "w_p", "w_p", "w_p", "w_p", "w_p", "w_p"],
  ["w_r", "w_n", "w_b", "w_q", "w_k", "w_b", "w_n", "w_r"]
];

function drawBoard() {
  ctx.clearRect(0, 0, 480, 480);
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      ctx.fillStyle = (row + col) % 2 === 0 ? "#d2b48c" : "#3a2416";
      ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
      const piece = board[row][col];
      if (piece) {
        const [color, type] = piece.split('_');
        ctx.fillStyle = "gold";
        ctx.font = "36px Georgia";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(pieces[type][color[0]], col * tileSize + tileSize / 2, row * tileSize + tileSize / 2);
      }
    }
  }
}

function getMousePos(evt) {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((evt.clientX - rect.left) / tileSize);
  const y = Math.floor((evt.clientY - rect.top) / tileSize);
  return { x, y };
}

canvas.addEventListener("click", e => {
  const { x, y } = getMousePos(e);
  const clicked = board[y][x];
  if (selected) {
    const [sy, sx] = selected;
    if (sy !== y || sx !== x) {
      if (isValidMove(sy, sx, y, x)) {
        board[y][x] = board[sy][sx];
        board[sy][sx] = "";
        selected = null;
        statusText.textContent = "Bot thinking...";
        drawBoard();
        setTimeout(botMove, 800);
        return;
      }
    }
    selected = null;
  } else if (clicked && clicked.startsWith("w")) {
    selected = [y, x];
  }
  drawBoard();
});

function isValidMove(sy, sx, dy, dx) {
  const piece = board[sy][sx];
  if (!piece) return false;
  const [color, type] = piece.split('_');
  const target = board[dy][dx];
  if (target && target.startsWith(color[0])) return false;

  const dyAbs = Math.abs(dy - sy);
  const dxAbs = Math.abs(dx - sx);

  switch (type) {
    case "p": {
      const dir = color === "w" ? -1 : 1;
      if (sx === dx && !target) {
        if (dy - sy === dir) return true;
        if ((sy === 6 && color === "w") || (sy === 1 && color === "b")) {
          if (dy - sy === dir * 2 && !board[sy + dir][sx]) return true;
        }
      }
      if (dxAbs === 1 && dy - sy === dir && target) return true;
      return false;
    }
    case "r": return sx === dx || sy === dy;
    case "n": return dxAbs * dxAbs + dyAbs * dyAbs === 5;
    case "b": return dxAbs === dyAbs;
    case "q": return dxAbs === dyAbs || sx === dx || sy === dy;
    case "k": return dxAbs <= 1 && dyAbs <= 1;
  }
  return false;
}

function botMove() {
  for (let y = 1; y < 7; y++) {
    for (let x = 0; x < 8; x++) {
      const piece = board[y][x];
      if (piece === "b_p" && !board[y + 1][x]) {
        board[y + 1][x] = "b_p";
        board[y][x] = "";
        drawBoard();
        statusText.textContent = "Your turn";
        return;
      }
    }
  }
}

function startGame(mode) {
  board = initBoard();
  selected = null;
  gameMode = mode;
  startMenu.classList.add("hidden");
  gameUI.classList.remove("hidden");
  drawBoard();
}

function pauseGame() {
  pauseMenu.classList.remove("hidden");
}

function resumeGame() {
  pauseMenu.classList.add("hidden");
}

drawBoard();
