const rows = 8;
const cols = 8;
let grid = [];
let userPath = [];
let allowUserPath = false;

const mazeDiv = document.getElementById('maze');
const popup = document.getElementById('popup');
const nomSound = document.getElementById('nomSound');

function generateMaze() {
  mazeDiv.innerHTML = '';
  grid = [];
  userPath = [];

  for (let i = 0; i < rows; i++) {
    grid[i] = [];
    for (let j = 0; j < cols; j++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = i;
      cell.dataset.col = j;

      const isStart = i === 0 && j === 0;
      const isEnd = i === rows - 1 && j === cols - 1;
      const isWall = Math.random() < 0.25 && !isStart && !isEnd;

      if (isWall) cell.classList.add('wall');
      if (isEnd) cell.innerHTML = '🧀';

      cell.addEventListener('click', () => toggleWall(i, j, cell));
      cell.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (allowUserPath && !isStart && !isEnd && !grid[i][j].isWall) {
          if (!cell.classList.contains('user-path')) {
            cell.classList.add('user-path');
            userPath.push([i, j]);
          } else {
            cell.classList.remove('user-path');
            userPath = userPath.filter(p => !(p[0] === i && p[1] === j));
          }
        }
      });

      grid[i][j] = { element: cell, isWall: isWall };
      mazeDiv.appendChild(cell);
    }
  }

  enableUserPathDrawing();
}

function toggleWall(i, j, cell) {
  const isStart = i === 0 && j === 0;
  const isEnd = i === rows - 1 && j === cols - 1;
  if (isStart || isEnd) return;
  grid[i][j].isWall = !grid[i][j].isWall;
  cell.classList.toggle('wall');
}

function enableUserPathDrawing() {
  allowUserPath = true;
}

async function startSolving() {
  for (let row of grid) {
    for (let cell of row) {
      cell.element.classList.remove('path', 'mouse', 'user-path');
      if (!cell.element.classList.contains('wall')) cell.element.textContent = '';
    }
  }

  grid[rows - 1][cols - 1].element.innerHTML = '🧀';

  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const reached = await solve(0, 0, visited);

  if (reached) {
    showPopup();
    playNomSound();
  }
}

async function solve(i, j, visited) {
  if (i < 0 || j < 0 || i >= rows || j >= cols) return false;
  if (grid[i][j].isWall || visited[i][j]) return false;

  visited[i][j] = true;

  const isGoal = i === rows - 1 && j === cols - 1;
  grid[i][j].element.innerHTML = '🐭';
  grid[i][j].element.classList.add('mouse');
  await new Promise(r => setTimeout(r, 150));

  if (!isGoal) {
    grid[i][j].element.innerHTML = '';
    grid[i][j].element.classList.remove('mouse');
    grid[i][j].element.classList.add('path');
  }

  if (isGoal) return true;
  if (await solve(i + 1, j, visited)) return true;
  if (await solve(i, j + 1, visited)) return true;
  if (await solve(i - 1, j, visited)) return true;
  if (await solve(i, j - 1, visited)) return true;

  return false;
}

async function startUserPath() {
  allowUserPath = false;
  for (let [i, j] of userPath) {
    const cell = grid[i][j];
    cell.element.innerHTML = '🐭';
    cell.element.classList.add('mouse');
    await new Promise(r => setTimeout(r, 200));
    cell.element.innerHTML = '';
    cell.element.classList.remove('mouse');
    cell.element.classList.add('path');
  }

  const [lastRow, lastCol] = userPath[userPath.length - 1] || [];
  if (lastRow === rows - 1 && lastCol === cols - 1) {
    showPopup();
    playNomSound();
  }
}

function showPopup() {
  popup.classList.remove('hidden');
}

function closePopup() {
  popup.classList.add('hidden');
}

function playNomSound() {
  nomSound.play();
}

generateMaze();
