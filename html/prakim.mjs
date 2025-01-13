import {Perk} from "./perk.mjs";

const DAILY_PRAKIM = [[1, 29], [30, 50], [51, 72], [73, 89], [90, 106], [107, 119], [120, 150]];
import {getPerkDuration} from "./resources.mjs";
export class Prakim {
  _weekDay
  _dailyPrakim = [[], [], [], [], [], [], []]
  _totalTimes = [0,0,0,0,0,0,0]
  _waitingTotals = {}
  _perkDurations = {}
  _current = undefined;
  _perk;
  _onPerkChange;

  set onPerkChange(onPerkChange) {
    this._onPerkChange = onPerkChange;
  }
  constructor(_weekDay) {
    this.weekDay = _weekDay
    this._perk = new Perk()
  }

  set weekDay(weekDay) {
    if (this._weekDay !== weekDay) {
      this._weekDay = weekDay;
      this.#current = undefined;
    }
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


  #NAVIGATIONS = {
    NEXT:()=> Math.min(this.to, this.#current + 1),
    PREVIOUS:() => Math.max(this.from, this.#current - 1),
    FIRST:() => this.from,
    LAST : () => this.to
  }

  navigate(destination) {
    destination = destination ?? 'FIRST';
    if (destination === true) {
      destination = 'NEXT'
    }
    if (destination === false) {
      destination = 'PREVIOUS'
    }
    if (isNaN(destination)) {
      destination = this.#NAVIGATIONS[destination.toUpperCase()]()
    }
    this.#current = destination
  }

  get #current(){
    return this._current ?? this.from
  }

  set #current(active) {
    const current = Math.max(this.from, Math.min(this.to, active ?? this.from));
    // _current can be undefined. but #current is never undefined. we want to trigger the update
    if (current !== this._current){
      this._current = current;
      this.updatePerkData().catch(console.error)
    }
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
          console.log('finished computing total time')
          this._onPerkChange && this._onPerkChange(this.Perk)
        })
    }
    return this._totalTimes[this.weekDay] ?? 0;
  }

  async wait() {
    await this.updatePerkData()
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

  get Perk(){
    this.updatePerkData().catch(console.error)
    return this._perk
  }

  async updatePerkData(){
    if (this._perk.perk !== this.#current) {
      await this._perk.updatePerkData(this.#current);
      this._onPerkChange && this._onPerkChange(this.Perk)
    }
    return this._perk
  }

  downloadTimes() {
    Perk.downloadTimes();
  }

}




