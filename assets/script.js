'use strict';

var app = new Vue({
  el: '#app',
  data: {
    pointerNone: false,
    isDisplay: false,
    isActive: false,
    title: '呪い診断',
    preQuestions: [],
    preAnswers: [],
    questions: [],
    preSorts: [],
    times: [],
    stageCount: 1,
    answers: [],
    answerActive: false
  },
  watch: {
    stageCount() {
      this.questions.splice(0);
      this.preQuestions.forEach(q => {
        if (q.time === this.stageCount) {
          this.questions.push(q);
        }
      });
      if (
        1 < this.stageCount &&
        this.isActive === false
      ) {
        this.isActive = true;
      } else if (this.stageCount <= 1) {
        this.isActive = false;
      }
    }
  },
  methods: {
    async registerQuestion() {
      const preData = await fetch('/work1/question.json');
      const data = await preData.json();
      await data.forEach(data_q => {
        this.preQuestions.push(data_q);
      });
      await this.preQuestions.forEach(q => {
        if (q.time === this.stageCount) {
          this.questions.push(q);
        }
        this.times.push(q.time);
      });
    },
    async registerAnswer() {
      const preData = await fetch('/work1/answer.json');
      const data = await preData.json();
      await data.forEach(data_a => {
        this.preAnswers.push(data_a);
      });
    },
    startTrigger() {
      const start = document.querySelector('.app-start');
      const target = document.querySelectorAll('.app-start-target');
      start.classList.add('fade-out');
      target[0].classList.add('fade-out');
      target[1].classList.add('fade-out');
      setTimeout(() => {
        start.classList.add('none');
      }, 1400);
    },
    judgeAnswer() {
      let sortsAmounts = [];
      const filteredSortsAmounts = [];
      const answersAmounts = [];
      const answersQuantities = [];
      this.preSorts.forEach(preS => {
        sortsAmounts = sortsAmounts.concat(preS);
      });
      sortsAmounts.forEach(sortAnswer => {
        if (filteredSortsAmounts.includes(sortAnswer) === false) {
          filteredSortsAmounts.push(sortAnswer);
        }
      });
      filteredSortsAmounts.forEach(filterdSortsA => {
        const answerQ = [];
        sortsAmounts.forEach(sortA => {
          if (sortA === filterdSortsA) {
            answerQ.push(filterdSortsA);
          }
        });
        answersAmounts.push(answerQ);
        answersQuantities.push(answerQ.length);
      });
      let maxAnswerQuantity = answersQuantities.reduce((a, b) => {
        return Math.max(a, b);
      });
      if (
        filteredSortsAmounts.includes('nutrition') === false &&
        filteredSortsAmounts.includes('stay-ap-late') === false &&
        filteredSortsAmounts.includes('amulet') === false
      ) { // safe, caution, gameover
        filteredSortsAmounts.forEach(answer => {
          answersAmounts.forEach(aA => {
            if (filteredSortsAmounts.includes('gameover') === false) {
              this.preAnswers.forEach(preA => {
                if (preA.case === 'safe') {
                  this.answers.push(preA);
                }
              });
            } else {
              if (
                aA.length === maxAnswerQuantity &&
                aA[0] === 'safe'
              ) {
                this.preAnswers.forEach(preA => {
                  if (preA.case === 'caution') {
                    this.answers.push(preA);
                  }
                });
              } else if (
                aA.length === maxAnswerQuantity &&
                aA[0] === 'gameover'
              ) {
                this.preAnswers.forEach(preA => {
                  if (preA.case === 'gameover') {
                    this.answers.push(preA);
                  }
                });
              }
            }
          });
        });
      } else if (
        filteredSortsAmounts.includes('nutrition') ||
        filteredSortsAmounts.includes('stay-ap-late') ||
        filteredSortsAmounts.includes('amulet')
      ) { // nutrition, stay-at-late, amulet, (gameover)
        if (filteredSortsAmounts.includes('nutrition')) {
          this.preAnswers.forEach(preA => {
            if (preA.case === 'nutrition') {
              this.answers.push(preA);
            }
          });
        }
        if (filteredSortsAmounts.includes('stay-at-late')) {
          this.preAnswers.forEach(preA => {
            if (preA.case === 'stay-at-late') {
              this.answers.push(preA);
            }
          });
        }
        if (filteredSortsAmounts.includes('amulet')) {
          this.preAnswers.forEach(preA => {
            if (preA.case === 'amulet') {
              this.answers.push(preA);
            }
          });
        }
        answersAmounts.forEach(aA => {
          if (
            aA[0] === 'gameover' &&
            aA.length > 3
          ) {
            this.answers.splice(0);
            this.preAnswers.forEach(preA => {
              if (preA.case === 'gameover') {
                this.answers.push(preA);
              }
            });
          } else if (
            aA.length === maxAnswerQuantity &&
            aA[0] === 'gameover'
          ) {
            this.answers.splice(0);
            this.preAnswers.forEach(preA => {
              if (preA.case === 'gameover') {
                this.answers.push(preA);
              }
            });
          }
        });
      }
      console.log(filteredSortsAmounts);
      console.log(answersAmounts);
      console.log(answersQuantities);
      const answersName = [];
      this.answers.forEach(a => {
        answersName.push(a.name);
      });
      console.log(answersName);
    },
    displayAnswer(c) {
      this.isDisplay = true;
      this.answerActive = true;
    },
    countUp(i) {
      if (i.sort) {
        console.log(i.sort);
      }
      this.preSorts.push(i.sort);
      let maxStageCount = this.times.reduce((a, b) => {
        return Math.max(a, b);
      });
      if (
        this.stageCount < maxStageCount &&
        i.case === undefined
      ) {
        this.stageCount++;
      } else if (i.case !== undefined) {
        this.pointerNone = true;
        this.preAnswers.forEach(preA => {
          if (preA.case === i.case) {
            this.answers.push(preA);
          }
        });
        setTimeout(this.displayAnswer, 1200);
      } else if (
        this.stageCount === maxStageCount &&
        i.case === undefined
      ) {
        this.judgeAnswer();
        setTimeout(this.displayAnswer, 1200);
      } else {
        alert('エラーだしん');
      }
    },
    countDown() {
      if (this.stageCount > 1) {
        this.stageCount--;
      }
      this.preSorts.pop();
    },
    reset() {
      console.clear();
      setTimeout(() => {
        this.answerActive = false;
        this.pointerNone = false;
        this.preSorts.splice(0);
        this.answers.splice(0);
      }, 400);
      setTimeout(() => {
        this.stageCount = 1;
        this.isDisplay = !this.isDisplay;
      }, 1200);
    }
  },
  mounted() {
    this.registerQuestion();
    this.registerAnswer();
  },
  updated() {
    const areaLis = document.querySelectorAll('.app-area-li');
    areaLis.forEach(li => {
      li.setAttribute('style', `--i: ${areaLis.length};`);
    });
    const answerLis = document.querySelectorAll('.app-answer-li');
    answerLis.forEach(li => {
      li.setAttribute('style', `--ii: ${answerLis.length};`);
    });
  }
});
