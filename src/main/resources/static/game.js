let currentPlayerIndex = 0;
let players = [];
let gameBoardData = [];

document.getElementById('startGame').addEventListener('click', startGame);

function startGame() {
    const rows = parseInt(document.getElementById('rows').value);
    const cols = parseInt(document.getElementById('cols').value);
    const mines = parseInt(document.getElementById('mines').value);
    const playerCount = parseInt(document.getElementById('players').value);
    const gameBoard = document.getElementById('gameBoard');
    const playerList = document.getElementById('playerList');

    gameBoard.innerHTML = '';
    playerList.innerHTML = '';
    gameBoard.style.gridTemplateRows = `repeat(${rows}, 30px)`;
    gameBoard.style.gridTemplateColumns = `repeat(${cols}, 30px)`;

    players = generatePlayers(playerCount);
    renderPlayerList(players, playerList);

    // AJAX 요청으로 보드 생성
    $.ajax({
        url: 'createBoard',
        method: 'GET',
        data: {
            rows: rows,
            cols: cols,
            mines: mines
        },
        dataType: 'json',
        success: function(response) {
            gameBoardData = response.board.split(",").map(row => row.split(""));
            renderBoard(gameBoardData, gameBoard);
        }
    });
    endPoint.innerHTML = ``;
}


//생성된 보드를 HTML 요소로 렌더링 후 각 셀에 클릭 이벤트와 우클릭 이벤트를 연결
function renderBoard(board, gameBoard) {
    board.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const cellElement = document.createElement('div'); //새로운 HTML <div> 요소를 생성 
            cellElement.classList.add('cell'); // cell 클래스 추가
            cellElement.dataset.row = rowIndex; //dataset을 사용해서 data-row라는 사용자 정의 데이터 속성을 추가
            cellElement.dataset.col = colIndex;

            cellElement.addEventListener('click', () => handleCellClick(cellElement, board));
            cellElement.addEventListener('contextmenu', (e) => handleRightClick(e, cellElement));

            gameBoard.appendChild(cellElement);
        });
    });
}

//좌클릭 함수
function handleCellClick(cellElement, board) {
    const row = parseInt(cellElement.dataset.row);
    const col = parseInt(cellElement.dataset.col);

    if (cellElement.classList.contains('flagged') || cellElement.classList.contains('revealed')) {
        return;
    }

    // AJAX 요청으로 지뢰인지 확인
    $.ajax({
        url: 'checkMine',
        method: 'GET',
        data: {
            row_String: row,
            col_String: col,
            board: board.map(row => row.join("")).join(",")
        },
        success: function(response) {
            if (response.isMine) {
                cellElement.classList.add('mine');
                alert(`${players[currentPlayerIndex]} hit a mine!`);
                revealBoard(board);
                endPoint.innerHTML = `<h2 style="color: red;">${players[currentPlayerIndex]} hit a mine!</h2>`;
            } else {
                revealCell(cellElement, board, row, col);
                const adjacentMines = countAdjacentMines(board, row, col);
                if (adjacentMines === 0) {
                    revealAdjacentCells(board, row, col);
                }
            }updatePlayerTurn();
        }
    });
}

//우클릭 함수
function handleRightClick(event, cellElement) {
    event.preventDefault();
    if (cellElement.classList.contains('revealed')) {
        return;
    }
    if (cellElement.classList.contains('flagged')) {
        cellElement.classList.remove('flagged');
        cellElement.textContent = '';
    } else {
        cellElement.classList.add('flagged');
        cellElement.textContent = '🚩';
    }
}

//보드 전체 공개
function revealBoard(board) {
    document.querySelectorAll('.cell').forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        if (board[row][col] === 'M') {
            cell.classList.add('mine');
        } else {
            revealCell(cell, board, row, col);
        }
    });
}
// 셀 1개 공개
function revealCell(cellElement, board, row, col) {
    cellElement.classList.add('revealed');
    const adjacentMines = countAdjacentMines(board, row, col);
    cellElement.textContent = adjacentMines > 0 ? adjacentMines : '';
}

//지뢰개수 확인
function countAdjacentMines(board, row, col) {
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],         [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];
    let count = 0; 

    directions.forEach(([dx, dy]) => {
        const newRow = row + dx;
        const newCol = col + dy;
        if (newRow >= 0 && newRow < board.length && newCol >= 0 && newCol < board[0].length) {
            if (board[newRow][newCol] === 'M') {
                count++;
            }
        }
    });

    return count;
}

//8방향에 지뢰 없을때 인접한 셀 자동으로 공개
function revealAdjacentCells(board, row, col) {
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],         [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    directions.forEach(([dx, dy]) => {
        const newRow = row + dx;
        const newCol = col + dy;
        if (newRow >= 0 && newRow < board.length && newCol >= 0 && newCol < board[0].length) {
            const adjacentCell = document.querySelector(`[data-row='${newRow}'][data-col='${newCol}']`);
            if (!adjacentCell.classList.contains('revealed') && !adjacentCell.classList.contains('flagged')) {
                revealCell(adjacentCell, board, newRow, newCol);
                const adjacentMines = countAdjacentMines(board, newRow, newCol);
                if (adjacentMines === 0) {
                    revealAdjacentCells(board, newRow, newCol);
                }
            }
        }
    });
}

////플레이어 관련 함수

function generatePlayers(playerCount) {
    const playerArray = [];
    for (let i = 0; i < playerCount; i++) {
        playerArray.push(`player${(i + 1).toString().padStart(2, '0')}`);
    }
    return playerArray;
}
function renderPlayerList(players, playerList) {
    currentPlayerIndex = 0;
    players.forEach((player, index) => {
        const playerElement = document.createElement('div');
        playerElement.classList.add('player');
        document.querySelectorAll('.player').forEach((player, index) => {
            if (index === currentPlayerIndex) {
                player.classList.add('highlight');
            } else {
                player.classList.remove('highlight');
            }
        });
        playerElement.textContent = player;
        playerElement.addEventListener('click', () => editPlayerName(index));
        playerList.appendChild(playerElement);
    });
}

//이름 수정
function editPlayerName(index) {
    const newName = prompt('Enter new name:', players[index]);
    if (newName) {
        players[index] = newName;
        document.querySelectorAll('.player')[index].textContent = newName;
    }
}


// 다음 플레이어로 턴 넘기는 함수
function updatePlayerTurn() {
    document.querySelectorAll('.player').forEach((player, index) => {
        player.classList.toggle('highlight', index === currentPlayerIndex);
    });
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
}


