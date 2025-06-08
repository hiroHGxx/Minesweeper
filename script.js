const GRID_SIZE = 10;
const NUMBER_OF_MINES = 10;

let board = [];
let gameOver = false;

// ゲームの初期化
function initGame() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    gameOver = false;
    board = [];
    
    // ボードの初期化
    for (let i = 0; i < GRID_SIZE; i++) {
        board[i] = [];
        for (let j = 0; j < GRID_SIZE; j++) {
            board[i][j] = {
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                adjacentMines: 0
            };
        }
    }
    
    // 地雷の配置
    placeMines();
    
    // 数字の計算
    calculateNumbers();
    
    // ボードの描画
    renderBoard();
}

// 地雷をランダムに配置
function placeMines() {
    let minesPlaced = 0;
    
    while (minesPlaced < NUMBER_OF_MINES) {
        const row = Math.floor(Math.random() * GRID_SIZE);
        const col = Math.floor(Math.random() * GRID_SIZE);
        
        if (!board[row][col].isMine) {
            board[row][col].isMine = true;
            minesPlaced++;
        }
    }
}

// 各セルの周囲の地雷の数を計算
function calculateNumbers() {
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
    ];
    
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (board[i][j].isMine) continue;
            
            let count = 0;
            
            for (const [dx, dy] of directions) {
                const newRow = i + dx;
                const newCol = j + dy;
                
                if (
                    newRow >= 0 && newRow < GRID_SIZE &&
                    newCol >= 0 && newCol < GRID_SIZE &&
                    board[newRow][newCol].isMine
                ) {
                    count++;
                }
            }
            
            board[i][j].adjacentMines = count;
        }
    }
}

// ボードを描画
function renderBoard() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            
            if (board[i][j].isRevealed) {
                cell.classList.add('revealed');
                if (board[i][j].isMine) {
                    cell.classList.add('mine');
                    cell.textContent = '💣';
                } else if (board[i][j].adjacentMines > 0) {
                    cell.textContent = board[i][j].adjacentMines;
                    // 数字ごとに色を変える
                    cell.style.color = [
                        '', 'blue', 'green', 'red', 'darkblue',
                        'brown', 'teal', 'black', 'gray'
                    ][board[i][j].adjacentMines];
                }
            } else if (board[i][j].isFlagged) {
                cell.classList.add('flagged');
                cell.textContent = '🚩';
            }
            
            cell.addEventListener('click', handleCellClick);
            cell.addEventListener('contextmenu', handleRightClick);
            
            gameBoard.appendChild(cell);
        }
    }
}

// セルのクリック処理
function handleCellClick(event) {
    if (gameOver) return;
    
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    const cell = board[row][col];
    
    if (cell.isRevealed || cell.isFlagged) return;
    
    if (cell.isMine) {
        // ゲームオーバー
        revealAllMines();
        gameOver = true;
        setTimeout(() => alert('ゲームオーバー！'), 10);
        return;
    }
    
    revealCell(row, col);
    renderBoard();
    
    // 勝利条件のチェック
    if (checkWin()) {
        gameOver = true;
        setTimeout(() => alert('おめでとうございます！クリアしました！'), 10);
    }
}

// 右クリック処理（フラグ設置）
function handleRightClick(event) {
    event.preventDefault();
    if (gameOver) return;
    
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    const cell = board[row][col];
    
    if (!cell.isRevealed) {
        cell.isFlagged = !cell.isFlagged;
        renderBoard();
    }
}

// セルを開く（再帰的に）
function revealCell(row, col) {
    if (
        row < 0 || row >= GRID_SIZE ||
        col < 0 || col >= GRID_SIZE ||
        board[row][col].isRevealed ||
        board[row][col].isFlagged
    ) {
        return;
    }
    
    board[row][col].isRevealed = true;
    
    // 空白セルの場合、周囲のセルも開く
    if (board[row][col].adjacentMines === 0) {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        
        for (const [dx, dy] of directions) {
            revealCell(row + dx, col + dy);
        }
    }
}

// すべての地雷を表示
function revealAllMines() {
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (board[i][j].isMine) {
                board[i][j].isRevealed = true;
            }
        }
    }
    renderBoard();
}

// 勝利条件のチェック
function checkWin() {
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            // 地雷でないセルで、まだ開かれていないセルがあればゲーム続行
            if (!board[i][j].isMine && !board[i][j].isRevealed) {
                return false;
            }
        }
    }
    return true;
}

// ゲーム開始
window.onload = initGame;
