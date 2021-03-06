import constants from './../data/constants.js';
import ViewHeader from './../view/view-header.js';
import Game1View from './../view/view-game-1.js';
import Game2View from './../view/view-game-2.js';
import Game3View from './../view/view-game-3.js';

export default class GamePresenter {
  constructor(model) {
    this.model = model;

    this._header = new ViewHeader(this.model.state);
    this.bind = () => this._header.bind();

    this._header.getBack = () => this.getBack();

    this.content = this.gameLevel;

    this.root = document.createElement(`div`);
    this.root.appendChild(this._header.render());
    this.root.appendChild(this.content.render());

    this.tick = () => this.model.tick();

    this._interval = null;
    this.game = null;

    this.startTimer();
  }

  get gameLevel() {
    if (this.model.gameIsOver() || !this.model.data[this.model.state.level]) {
      this.onEndGame(this.model.state, this.playerName);

      return false;
    }

    switch (this.model.data[this.model.state.level].type) {
      case `game1`:
        this.game = new Game1View(this.model.data[this.model.state.level], this.model.state.answers);

        break;

      case `game2`:
        this.game = new Game2View(this.model.data[this.model.state.level], this.model.state.answers);

        break;

      case `game3`:
        this.game = new Game3View(this.model.data[this.model.state.level], this.model.state.answers);

        break;
    }

    this.game.onAnswer = (answer) => this._onAnswer(answer);

    return this.game;
  }

  get element() {
    return this.root;
  }

  updateGame() {
    const level = this.gameLevel;

    if (level) {
      this.root.childNodes[1].replaceChild(level.element, this.root.childNodes[1].childNodes[0]);
      this.content = level;
      this.content.bind();
      this.startTimer();
    }
  }

  updateHeader() {
    const header = new ViewHeader(this.model.state);

    header.getBack = () => this.getBack();
    this._header.bind = () => this.bind();

    this.root.childNodes[0].replaceChild(header.render().childNodes[0], this.root.childNodes[0].childNodes[0]);

    this._header = header;
    this._header.bind();
  }

  startTimer() {
    this._interval = setInterval(() => {
      this.model.tick();

      if (this.model.state.time <= 0) {
        this._onAnswer(false);

      } else {
        this.updateHeader();

        if (this.model.state.time <= constants.MIN_TIME) {
          const timer = document.querySelector(`.game__timer`);

          setTimeout(() => {
            timer.style.display = (timer.style.display === `none` ? `` : `none`);
          }, constants.TIME_TO_FLASH);
        }
      }
    }, constants.ONE_SEC);
  }

  stopTimer() {
    clearInterval(this._interval);
    this.model.resetTimer();
  }

  restartGame() {
    this.model.restartGame();
  }

  updateTimer() {

  }

  _onAnswer(answer) {
    this.model.onAnswer(answer);
    this.stopTimer();
    this.updateHeader();
    this.updateGame();
  }

  onEndGame() {}
}
