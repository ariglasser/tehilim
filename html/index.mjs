
import {getGematria} from "./gematria.mjs";
import {Prakim} from "./prakim.mjs";
import {Properties} from "./Properties.mjs";
import {loadPerkAudio} from "./resources.mjs";
const SVG_PLAY = `
 <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="black">
 <polygon points="5,3 19,12 5,21" />
 </svg>`

const SVG_PAUSE = `
 <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
 <rect x="6" y="4" width="4" height="16" />
 <rect x="14" y="4" width="4" height="16" />
 </svg>`

const SVG_DROPDOWN = `   <svg viewBox="0 0 24 26" fill="black" xmlns="http://www.w3.org/2000/svg">
                    <rect x='3' y="18" width="20" height="3"  fill="black"></rect>
                    <rect x='3' y="12" width="20" height="3"  fill="black"></rect>
                    <rect x='3' y="6"  width="20" height="3"  fill="black"></rect>
                </svg>
`

const SVG_NAVIGATE_BUTTONS=[
    `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor"
                 stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 18l7-6-7-6v12z"/>
                <path d="M13 18l7-6-7-6v12z"/>
            </svg>`,
    `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor"
                 stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 6l6 6-6 6V6z"/>
            </svg>`,
    `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor"
                 stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 18l-6-6 6-6v12z"/>
            </svg>`,
    `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor"
                 stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 6l-7 6 7 6V6z"/>
                <path d="M11 6l-7 6 7 6V6z"/>
            </svg>`
  ]; //['⏮','⏪','⏯','⏩','⏭
//'⏮','⏪','⏯','⏩','⏭'

export class Controller {
  prakim;
  _audioPlayer;
  _perkTable;
  _config;
  _progress1;
  _progress2;
  _timeDisplay;
  _playBtn;
  isinPlayState;

  constructor() {
    this.prakim = new Prakim();
    this.config.weekDay = this.prakim.weekDay
    // speedLabel.textContent = `Speed ${this.config.playBackRate}:`;
    this.renderPrakimHeader();

    this.prakim.navigate(this.config.perk ?? 'first')
  }


  renderPrakimHeader() {
    const prakimHeader = document.getElementById('prakimHeader');
    prakimHeader.innerHTML=
      this.prakim.prakim
        .map(p => `<span id="perk_${p}" class="perk_header"> ${getGematria(p)}</span>`)
        .join(',');

    document.querySelectorAll('.perk_header').forEach((el,i) => {
      el.dataset.perek = this.prakim.perkAt(i);
      el.addEventListener('click', (e) => this.prakim.navigate(e.currentTarget.dataset.perek*1));
    });

  }

  isPlaying(){
    return !this.audioPlayer.paused && !this.audioPlayer.ended;
  }
  showRow(e, rowNumber) {
    if (!this.config.isFixTimes || e?.target?.classList.contains('row_num')) {
      this.audioPlayer.currentTime = this.prakim.Perk.getRowStartTime(rowNumber);
    } else {
      if (this.isPlaying()) {
        this.prakim.Perk.setLineTimes(rowNumber, this.audioPlayer.currentTime);
      }
    }
  }

  clearOverrides() {
    this.audioPlayer.currentTime = 0;
    this.prakim.Perk.clearOverrides()
  }

  get audioPlayer() {
    return this._audioPlayer ?? (this._audioPlayer = document.getElementById('audioPlayer'));
  }
  const  = document.getElementById('');

  get progress1() {
    return this._progress1 ?? (this._progress1 = document.getElementById('progress1'));
  }

  get progress2() {
    return this._progress2 ?? (this._progress2 = document.getElementById('progress2'));
  }

  get timeDisplay() {
    return this._timeDisplay ?? (this._timeDisplay = document.getElementById('timeDisplay'));
  }

  get playBtn() {
    return this._playBtn ?? (this._playBtn = document.getElementById('playBtn'));
  }


  get perkTable() {
    return this._perkTable ?? (this._perkTable = document.getElementById('perkTable'));
  }

  onPerkChange = async(Perk) => {
    console.log('on perk change', Perk.perk)
    this.showPerk(Perk);

    return this.playPerk(Perk.perk)

  }

  async playPerk(perk) {
    this.audioPlayer.src = await loadPerkAudio(perk);
    this.audioPlayer.playbackRate = this.config.playBackRate
    if (this.isinPlayState) {
      this.audioPlayer.play()
    } else {
      this.updateProgress()
    }
  }

  showPerk(Perk) {
    //log the current scroll position
    window.scroll({
      top: 0,
      // behavior: 'smooth' // Optional: Use 'auto' for instant scrolling
    });

    document.querySelectorAll('.perk_header.active').forEach((el) => el.classList.remove('active'));
    document.getElementById(`perk_${Perk.perk}`).classList.add('active');

    this.perkTable.innerHTML = this.prakim.Perk.generatePerkTableHTML();
    [...document.getElementsByClassName('row')].forEach((el,i) => el.addEventListener('click', (e) => this.showRow(e,i)));
    document.getElementById('resetHeader').addEventListener('dblclick',()=> this.clearOverrides())
  }

  get config() {
    return this._config ?? (this._config = new Properties())
  }

  formatTime(seconds) {
    seconds = isNaN(seconds) ? 0 : seconds;

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    // Format the time parts as strings with leading zeros if needed
    const hrsStr = hrs.toString().padStart(2, '0')
    const minsStr = mins.toString().padStart(2, '0')
    const secsStr = secs.toString().padStart(2, '0')

    // Combine the parts and return the formatted string
    return `${hrs > 0 ? hrsStr + ':' : ''}${minsStr}:${secsStr}`.trim();
  }

  updateProgress () {
    if (!!this.isinPlayState !== !this.audioPlayer.paused) {
      this.isinPlayState = !this.audioPlayer.paused;
      this.playBtn.innerHTML = this.isinPlayState ?  SVG_PAUSE : SVG_PLAY
    }

    const audioPlayerTime = this.audioPlayer.currentTime;
    //const audioPlayerDuration = this.audioPlayer.duration;
    const audioPlayerDuration = this.prakim.Perk.duration;
    const speed = this.config.playBackRate;

    const adjustedDuration = audioPlayerDuration / speed;
    const adjustedPlayTime = audioPlayerTime / speed;
    const totalAdjustedDuration = this.prakim.totalTime / speed;
    const totalAdjustedPlayTime = this.prakim.perkStartAt / speed;


    // Calculate the percentage of progress
    const percent1 = ((audioPlayerTime / audioPlayerDuration) * 100) || 0;
    const percent2 = (((audioPlayerTime + this.prakim.perkStartAt )/this.prakim.totalTime) * 100) || 0;
    this.prakim.Perk.selectLineAtTime(audioPlayerTime);

    this.progress1.style.width = percent1 + '%';
    this.progress2.style.width = percent2 + '%';
    this.timeDisplay.textContent = `${this.formatTime(adjustedPlayTime)
    }/${this.formatTime(adjustedDuration)
    } (${this.formatTime(totalAdjustedPlayTime)
    }/${this.formatTime(totalAdjustedDuration )})`;
  }

   togglePlayState() {
    if (this.audioPlayer.paused) {
      this.audioPlayer.play()
    } else {
      this.audioPlayer.pause();
    }
  }

  onPerkEnd(){
    this.config.isPlayNext && this.prakim.navigate('NEXT')
  }

  async addListeners() {
    this.playBtn.innerHTML = SVG_PLAY
    document.getElementById('playBackRate').value = this.config.playBackRate;
    document.getElementById('isSound').checked = this.config.isSound;
    document.getElementById('isPlayNext').checked = this.config.isPlayNext;
    document.getElementById('isFixTimes').checked = this.config.isFixTimes;
    document.getElementById('daysOfWeek').value = this.config.weekDay

    this.config.bindToElement('playBackRate', 'input' , 'target.value','playBackRate')
    this.config.bindToElement('isSound', 'change','target.checked', 'isSound');
    this.config.bindToElement('isPlayNext', 'change','target.checked', 'isPlayNext');
    this.config.bindToElement('isFixTimes', 'change','target.checked', 'isFixTimes');
    this.config.bindToElement('isAutoScroll', 'change','target.checked', 'isAutoScroll');
    this.config.bindToElement('daysOfWeek', 'change','target.selectedIndex', 'weekDay');



    document.getElementById('dropdown').innerHTML = SVG_DROPDOWN
    const downloadTimes = document.getElementById('downloadTimes');
    downloadTimes.addEventListener('click',()=> this.prakim.downloadTimes());
    downloadTimes.style.display = this.config.isFixTimes ? 'inline' : 'none';


    this.audioPlayer.addEventListener('ended', () => this.onPerkEnd());
    this.audioPlayer.addEventListener('timeupdate', ()=>this.updateProgress());

    const volumeControl = document.getElementById('volume');
    const volumeLabel = document.getElementById('volumeLabel');


    volumeControl.addEventListener('input', (e) => {
      this.audioPlayer.volume = e.target.value;
      volumeLabel.textContent = `Volume ${e.target.value}:`;
    })

    const speedLabel = document.getElementById('speedLabel');
    this.config.on("playBackRateChange", (e) => {
      this.audioPlayer.playbackRate = e.detail.value;
      speedLabel.textContent = `Speed ${e.detail.value}:`;
      if (this.audioPlayer.paused) {
        this.updateProgress()
      }
    })
    this.config.on("isSoundChange", (e) => {
      e.detail.value ? this.audioPlayer.play(): this.audioPlayer.pause();
    })
    this.config.on("isFixTimesChange", (e) => {
      downloadTimes.style.display = e.detail.value ? 'inline' : 'none';
    })
    this.config.on('weekDayChange', async (e)=> {
      this.prakim.weekDay = e.detail.value;
      this.renderPrakimHeader();
    });
    this.playBtn.addEventListener('click', ()=>this.togglePlayState());

    const navigateTo = ["FIRST", "PREVIOUS", "NEXT", "LAST"];
    ['firstButton','prevButton','nextButton','lastButton']
      .forEach((buttonId,i)=>{
        const button = document.getElementById(buttonId);
        button.innerHTML = SVG_NAVIGATE_BUTTONS[i];
        button.dataset.action = navigateTo[i];
        button.addEventListener('click', (e) => this.prakim.navigate(e.currentTarget.dataset.action));
      });

    const progressBar = document.getElementById('progressContainer');
    progressBar.addEventListener('click', (event) => {
      const progressBarWidth =  progressBar.clientWidth;
      const clickPosition = event.target.clientWidth - event.offsetX;
      const clickPercentage = (clickPosition / progressBarWidth) * 100;


      if(this.audioPlayer.readyState >= 2) {
        this.audioPlayer.currentTime = (clickPercentage / 100) * this.audioPlayer.duration;
      }
    });
    this.prakim.onPerkChange = this.onPerkChange;
  }
}




