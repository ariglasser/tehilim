const DAILY_PRAKIM = [[1, 29], [30, 50], [51, 72], [73, 89], [90, 106], [107, 119], [120, 150]];
import {getPerkDuration} from "./resources.mjs";
export class Prakim {
  _weekDay
  _dailyPrakim = [[], [], [], [], [], [], []]
  _totalTimes = [0,0,0,0,0,0,0]
  _waitingTotals = {}
  _perkDurations = {}
  _current = undefined;

  constructor(_weekDay) {
    this.weekDay = _weekDay
  }

  set weekDay(_weekDay) {
    this._weekDay = _weekDay;
    this._current = undefined;
  }

  get weekDay() {
    return this._weekDay ?? (this._weekDay = new Date().getDay());
  }

  get prakim() {
    if (!this._dailyPrakim[this.weekDay].length) {
      const [from, to] = DAILY_PRAKIM[this.weekDay];
      this._dailyPrakim[this.weekDay] = Array.from({length: to - from + 1}, ((_, i) => from + i));
    }
    return this._dailyPrakim[this.weekDay];
  }

  get from() {
    return DAILY_PRAKIM[this.weekDay][0];
  }

  get to() {
    return DAILY_PRAKIM[this.weekDay][1];
  }

  * [Symbol.iterator]() {
    for (let perk of this.prakim) {
      yield perk;
    }
  }

  get length() {
    return this.from - this.to + 1;
  }

  get NEXT() {
    this._current = !this._current ? this.from : Math.min(this.to, this._current + 1);
    return this._current;
  }
  get PREVIOUS() {
    this._current = !this._current ? this.from : Math.max(this.from, this._current - 1);
    return this._current;
  }
  get FIRST() {
    this._current = this.from;
    return this._current;
  }
  get LAST() {
    this._current = this.to;
    return this._current;
  }
  get CURRENT() {
    return this._current;
  }

  set CURRENT(perk) {
    perk = perk ?? 'FIRST';
    if (perk === true) {
      perk = 'NEXT'
    }
    if (perk === false) {
      perk = 'PREVIOUS'
    }
    if (isNaN(perk)) {
      const current = this[perk.toUpperCase()];
      if (!current){
        console.log(`perk ${perk} not found`)
      }
    } else {
      this._current = Math.min(this.to, perk);
      this._current = Math.max(this.from, perk);
    }
  }

  set perk(perk) {
    this.CURRENT = perk;
  }

  get perk() {
    return this.CURRENT
  }

  setPerk(perk){
    this.CURRENT = perk;
    return this.CURRENT
  }

  perkAt(index){
    return this.prakim[index]
  }
  get totalTime() {
    if (!this._totalTimes[this.weekDay] && !this._waitingTotals[this.weekDay]) {
      this._waitingTotals[this.weekDay] = this.loadDurations(this.prakim)
        .then((total)=>{
          this._totalTimes[this.weekDay] = total
          delete this._waitingTotals[this.weekDay]
        })
    }
    return this._totalTimes[this.weekDay] ?? 0;
  }

  async wait() {
    if (!this._totalTimes[this.weekDay] && !this._waitingTotals[this.weekDay]) {
      this.totalTime;
    }
    if (!this._totalTimes[this.weekDay] && this._waitingTotals[this.weekDay]) {
      return this._waitingTotals[this.weekDay];
    }
    return this._totalTimes[this.weekDay];
  }

  async loadDurations(prakim) {
    return prakim.reduce(async (total, perek)=>{
      const {duration} = await this.getPerkTimes(perek, total)
      return await total + await duration
    },Promise.resolve(0))
  }

  async getPerkTimes(perk, startAt = undefined) {
    if (!this._perkDurations[perk]) {
      if (!startAt) {
        console.log('requesting perk times without startAt')
      }
      this._perkDurations[perk] = {startAt: await startAt, duration: await getPerkDuration(perk)}
    }
    return this._perkDurations[perk];
  }

  get perkTimes() {
    if (!this._current || !this._perkDurations[this._current]) {
      return {};
    }
    return this._perkDurations[this._current]
  }

  get perkDuration() {
    return  this.perkTimes.duration ?? 0
  }

  get perkStartAt() {
    return  this.perkTimes.startAt ?? 0
  }
}


