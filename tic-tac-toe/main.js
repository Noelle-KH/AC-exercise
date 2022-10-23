const WINNER_POSITION = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
  [1, 4, 7],
  [2, 5, 8],
  [3, 6, 9],
  [1, 5, 9],
  [3, 5, 7]
]
const gameStatus = {
  circleRound: true,
  circlePosition: [],
  crossPosition: [],
  gameStep: 0
}
const table = document.querySelector('#app')

// 棋盤上畫上O或X
function draw(cell, shape) {
  const div = cell.querySelector('div')
  if (div) {
    if (div.classList.contains('circle') || div.classList.contains('cross')) return
  }

  cell.innerHTML = `<div class="${shape}"></div>`
  gameStatus.gameStep++
  gameStatus.circleRound = !gameStatus.circleRound
  getPosition(cell.dataset.index, shape)
}

// 將O和X下的位置放進各自的陣列中
function getPosition(index, shape) {
  if (shape === 'circle') {
    gameStatus.circlePosition.push(Number(index))
  } else {
    gameStatus.crossPosition.push(Number(index))
  }
  checkWinner()
}

// 確認贏家
function checkWinner() {
  for (const line of WINNER_POSITION) {
    if (line.every(position => gameStatus.circlePosition.includes(position))) {
      return drawWinner('Circle')
    } else if (line.every(position => gameStatus.crossPosition.includes(position))) {
      return drawWinner('Cross')
    }
  }

  // 假如沒有贏家狀態則為平手
  if (gameStatus.gameStep === 9) {
    return drawWinner('tie')
  }
}

// 畫出遊戲結束畫面
function drawWinner(shape) {
  const proclamation = (shape === 'tie') ? `It's ${shape} ` : `${shape} is winner.`
  const div = document.createElement('div')
  div.classList.add('completed')
  div.innerHTML = `
    <p>${proclamation}</p>
    <button class="reset">Reset Game</button>
  `
  document.body.appendChild(div)

  const button = document.querySelector('.reset')
  button.addEventListener('click', resetGame)
}

// 重新開啟遊戲
function resetGame() {
  const div = document.querySelector('.completed')
  const cells = document.querySelectorAll('td div')
  document.body.removeChild(div)
  cells.forEach(cell => cell.remove())
  gameStatus.circlePosition = []
  gameStatus.crossPosition = []
  gameStatus.circleRound = true
  gameStatus.gameStep = 0
}

// 監聽棋盤的點擊事件
table.addEventListener('click', event => {
  if (event.target.tagName !== 'TD') return

  if (gameStatus.circleRound) {
    draw(event.target, 'circle')
  } else {
    draw(event.target, 'cross')
  }
})

