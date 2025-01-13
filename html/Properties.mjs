const DEFAULTS = {
  playBackRate:1,
  isPlayNext:true,
  isSound:true,
  perk:undefined,
  weekDay:new Date().getDay(),
  isFixTimes:true,
  isAutoScroll:true
}
const reduceValue =(element,path) =>
  path.split('.').reduce((o, k) => o[k], element)

const setReducedValue =(element,path,value) => {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const o = keys.reduce((o, k) => o[k], element) ?? element;
  o[lastKey] = value;
}

let _instance;
export class Properties extends EventTarget {
  elements = {}
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
    this.elements[property] = {element,path};
    element.addEventListener(eventName, e=>
      this[property] = reduceValue(e,`target.${path}`)
    )
  }

  #setValue = (key, value) =>{

    const old = this._config[key]

    if (old !== value) {
      this._config[key] = value;
      this.#save();
      this.emit(`${key}Change`, {old, value});
    }
    if (this.elements[key]) {
      const {element,path} = this.elements[key]
      setReducedValue(element,path,value)
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


