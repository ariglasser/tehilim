const DEFAULTS = {
  playBackRate:1,
  isPlayNext:true,
  isSound:true,
  perk:undefined,
  weekDay:new Date().getDay(),
  isFixTimes:true,
  isAutoScroll:true
}
let _instance;
export class Properties extends EventTarget {
  constructor() {
    super();
    if (!_instance) {
      _instance = this;
      this.on('weekdayChange',({oldValue,value})=> this.perk = oldValue !== value ? this.perk : undefined)
      this.#load();
    }
    return _instance
  }

  #load() {
    this._config = {...DEFAULTS, ...JSON.parse(window.localStorage.getItem('config') ?? '{}')};
    // this.weekDay = new Date().getDay()
  }

  #save() {
    const value = JSON.stringify({...this._config})
    localStorage.setItem('config', value);
  }

    get playBackRate() {
      return this._config['playBackRate']
    }

    set playBackRate(value) {
      this.#setValue('playBackRate',value)
    }

  get isPlayNext() {
    return this._config['isPlayNext']
  }

  set isPlayNext(value) {
    this.#setValue('isPlayNext',value)
  }

  get isSound() {
    return this._config['isSound']
  }

  set isSound(value) {
    this.#setValue('isSound',value)
  }

  get perk() {
    return this._config['perk']
  }

  set perk(value) {
    this.#setValue('perk',value)
  }

  get weekDay() {
    return this._config['weekDay']
  }

  set weekDay( value) {
    if (value === undefined || this.weekDay !== value ) {
      this.perk = undefined
    }
    this.#setValue('weekDay',value)
  }

  get isFixTimes() {
    return this._config['isFixTimes']
  }

  set isFixTimes(value) {
    this.#setValue('isFixTimes',value)
  }

  get isAutoScroll() {
    return this._config['isAutoScroll']
  }

  set isAutoScroll(value) {
    this.#setValue('isAutoScroll',value)
  }

  bindToElement(id,eventName,path,property){
    const element = document.getElementById(id);
    element.addEventListener(eventName, e=> {
      this[property] = path.split('.').reduce((o, k) => {
        return o[k]
      }, e)
    })

  }

  #setValue = (key, value) =>{

    const old = this._config[key]
    if (old !== value) {
      this._config[key] = value;
      this.#save();
      this.emit(`${key}Change`, {old, value});
    }
    return old;
  }

  emit(eventName, detail) {
    this.dispatchEvent(new CustomEvent(eventName, {detail}));
  }

  on(eventName, listener) {
    this.addEventListener(eventName, listener);
  }

  off(eventName, listener) {
    this.removeEventListener(eventName, listener);
  }
}


