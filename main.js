const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}

const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]

const view = {
  getCardElement (index) {
    return ` <div data-index="${index}" class="card back"></div>`
  },

  getCardContent (index){
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index/13)]
    return `
      <p>${number}</p>
      <img src="${symbol}" />
      <p>${number}</p>
    `
  },

  displayCards (indexes) {
    const root = document.querySelector('#cards')
    root.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },

  transformNumber (number) {
    switch(number){
      case 1:
        return 'A';
      case 11:
        return 'J';
      case 12:
        return 'Q';
      case 13:
        return 'K';
      default:
        return number;
    }
  },
  flipCards(...cards){
    cards.map(card => {
      if (card.classList.contains('back')){
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
    card.classList.add('back')
    card.innerHTML = null;
    })
  },

  pairCard(...cards){
    cards.map(cards => {
      cards.classList.add('paired');
    })
  },

  renderScore(score){
     document.querySelector(".score").textContent = `Score: ${score}`;
  },
  renderTriedTimes(times){
     document.querySelector(".tried").textContent = `You've tried: ${times} times`;
  },

  appendWrongAnimation(...cards){
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event =>{
        event.target.classList.remove('wrong'), {once : true}
      })
    })
  },

  showGameFinished (){
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
    <p>Congratulations! You've completed the game!</p>
    <p>You score ${model.score}</p>
    <p>You've tried ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}

const utility = {
  getRandomNumberArray(count){
    const number = Array.from(Array(count).keys())
    for (let index = number.length-1; index > 0; index--){
      let randomIndex = Math.floor( Math.random() * (index + 1))
         ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number;
  }
}

const model ={
  revealedCards : [],
  
  score : 0,
  triedTimes: 0,

  isRevealedCardMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  }
}

const controller = {
  currentState : GAME_STATE.FirstCardAwaits,
  generateCards () {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  dispatchCardAction(card){
    if(!card.classList.contains('back')){
      return
    }
      
    switch (this.currentState){
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break;

      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealedCards.push(card)
        if (model.isRevealedCardMatched()){
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardsMatched
          view.pairCard(...model.revealedCards)
          model.revealedCards = []

          if (model.score === 260){
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }

          this.currentState = GAME_STATE.FirstCardAwaits;
        } else {
          this.currentState = GAME_STATE.CardsMatchFailed;
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000);
        }
        break;
    }
  },
  resetCards(){
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }
}
controller.generateCards()

document.querySelectorAll('.card').forEach(card =>{
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
})