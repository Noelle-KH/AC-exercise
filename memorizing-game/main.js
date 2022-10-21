const SYMBOLS = [
  './resource/spade.png', // 0-12黑桃
  './resource/heart.png', // 13-25愛心
  './resource/diamond.png', // 26-38方塊
  './resource/club.png' // 39-52梅花
]

const GAME_STATE = {
  firstCardAwaits: "firstCardAwaits",
  secondCardAwaits: "secondCardAwaits",
  cardsMatchFailed: "cardsMatchFailed",
  cardsMatched: "cardsMatched",
  gameFinished: "gameFinished"
}

const view = {
  getCardElement(index) {
    return `
      <div class="card back" data-index="${index}"></div>
    `
  },
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = SYMBOLS[Math.floor(index / 13)]
    return `
      <p>${number}</p>
      <img src="${symbol}" alt="Symbol">
      <p>${number}</p>
      `
  },
  displayCards(indexes) {
    const root = document.querySelector('#cards')
    root.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },
  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },
  flipCards(...cards) {
    cards.map(card => {
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
  
      card.classList.add('back')
      card.innerHTML = null
    })
  },
  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },
  renderScore(score) {
    document.querySelector('.score').textContent = `Score: ${score}`
  },
  renderTriedTimes(times) {
    document.querySelector('.tried').textContent = `You've tried: ${times} times.`
  },
  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event => event.target.classList.remove('wrong'), { once: true })
    })
  },
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}

const model = {
  score: 0,
  triedTimes: 0,
  revealedCards: [],
  isRevealedCardsMarched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  }
}

const controller = {
  currentState: GAME_STATE.firstCardAwaits,
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },
  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return
    }
    switch (this.currentState) {
      case GAME_STATE.firstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.secondCardAwaits
        break
      case GAME_STATE.secondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealedCards.push(card)

        if (model.isRevealedCardsMarched()) {
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.cardsMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          if (model.score === 260) {
            this.currentState = GAME_STATE.gameFinished
            view.showGameFinished()
            return
          }
          this.currentState = GAME_STATE.firstCardAwaits
        } else {
          this.currentState = GAME_STATE.cardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)
        }
        break
    }
  },
  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.firstCardAwaits
  }
}

const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      // Math.floor()如果沒有加上分號會和後面[]連起來，會進而產生錯誤，必須將他隔開
      let randomIndex = Math.floor(Math.random() * (index + 1));
      [number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

controller.generateCards()
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
})