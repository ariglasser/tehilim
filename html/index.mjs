
import {getGematria} from "./gematria.mjs";
import {Prakim} from "./prakim.mjs";
import {Properties} from "./Properties.mjs";
import {loadPerkAudio} from "./resources.mjs";
import {SVG_NAVIGATE_BUTTONS,
  SVG_DROPDOWN,
  SVG_PAUSE,
  SVG_PLAY} from './svg.mjs'

export class Controller {
  prakim;
  _audioPlayer;
  _perkTable;
  _config;
  _progress1;
  _progress2;
  _timeDisplay;
  _playBtn;
  isinPlayState = false;

  constructor() {
    this.prakim = new Prakim();
    this.config.weekDay = this.prakim.weekDay
    // this.renderPrakimHeader();
    this.prakim.navigate(this.config.perk ?? 'first')
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

  get config() {
    return this._config ?? (this._config = new Properties())
  }

  get isAudioPlayerPlaying() {
    return !this.audioPlayer.paused && !this.audioPlayer.ended;
  }

  onPerkChange( Perk) {
     console.log('on perk change', Perk.perk)
      this.showPerk(Perk);
      return this.playPerk(Perk.perk)
  }

  onPerkEnd(){
    this.config.isPlayNext && this.prakim.navigate('NEXT')
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

  onRowClick(e, rowNumber) {
    console.log('click on row', rowNumber)
    if (this.config.isFixTimes && e?.target?.classList.contains('row_txt')) {
      this.prakim.Perk.fixLineStartTime(rowNumber, this.audioPlayer.currentTime);
    } else {
      //set the audio player time to that row, add a 0.1 so we move to the next line
      this.audioPlayer.currentTime = this.prakim.Perk.getRowStartTime(rowNumber) + 0.1;
    }
  }

  clearOverrides() {
    this.audioPlayer.currentTime = 0;
    this.prakim.Perk.clearOverrides()
  }

  async playPerk(perk) {
    this.audioPlayer.src = await loadPerkAudio(perk);
    this.audioPlayer.playbackRate = this.config.playBackRate
    this.isinPlayState
      ? this.audioPlayer.play()
      : this.updateProgress()
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

    [...document.getElementsByClassName('row')].forEach((el,i) => el.addEventListener('click', (e) => this.onRowClick(e,i)));
    document.getElementById('resetHeader').addEventListener('dblclick',()=> this.clearOverrides())
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

  updateProgress (highlightLine = false) {
    const audioPlayerTime = this.audioPlayer.currentTime;
    //const audioPlayerDuration = this.audioPlayer.duration;
    const audioPlayerDuration = this.prakim.Perk.duration;
    const speed = this.config.playBackRate;

    const adjustedDuration = audioPlayerDuration / speed;
    const adjustedPlayTime = audioPlayerTime / speed;
    const totalAdjustedDuration = this.prakim.totalTime / speed;
    const totalAdjustedPlayTime = (this.prakim.perkStartAt + audioPlayerTime) / speed ;


    // Calculate the percentage of progress
    const percent1 = ((audioPlayerTime / audioPlayerDuration) * 100) || 0;
    const percent2 = (((audioPlayerTime + this.prakim.perkStartAt )/this.prakim.totalTime) * 100) || 0;

    this.progress1.style.width = percent1 + '%';
    this.progress2.style.width = percent2 + '%';
    this.timeDisplay.textContent = `${this.formatTime(adjustedPlayTime)
    }/${this.formatTime(adjustedDuration)
    } (${this.formatTime(totalAdjustedPlayTime)
    }/${this.formatTime(totalAdjustedDuration )})`;
    if (highlightLine) {
      this.prakim.Perk.highlightLineAtTime(audioPlayerTime);
    }
  }

  setInteractiveTimeout(){
    const speed = this.config.playBackRate
    const audioPlayerTime = this.audioPlayer.currentTime;
    const lineEndTime = this.continueFromInteractiveTime ? this.prakim.Perk.nextLineEndTime : this.prakim.Perk.currentLineEndTime;
    this.continueFromInteractiveTime = undefined;
    const lineDuration = (lineEndTime - audioPlayerTime)/speed * 1000;
    console.log('togglePlayState from paused to play', this.prakim.Perk.currentLine, audioPlayerTime, lineEndTime , lineEndTime - audioPlayerTime , lineDuration)
    this.interactiveTimer = setTimeout(()=>this.togglePlayState(), lineDuration)
  }

  togglePlayState() {
    if (this.interactiveTimer){
      console.log('clear interactive timer')
      clearTimeout(this.interactiveTimer)
      this.interactiveTimer = undefined;
    }
    if (this.audioPlayer.paused) {
      console.log('togglePlayState from paused to play')
      this.config.isSound = true;
      this.isinPlayState = true;
      this.playBtn.innerHTML = SVG_PAUSE;
      if (this.config.isInteractive) {
        this.setInteractiveTimeout()
      }
      this.audioPlayer.play()
    } else {
      console.log('togglePlayState from play to paused')
      this.isinPlayState = false;
      this.audioPlayer.pause();
      this.playBtn.innerHTML = SVG_PLAY;
      this.continueFromInteractiveTime = this.config.isInteractive;
    }
  }

  async addListeners() {
    this.playBtn.innerHTML = SVG_PLAY
    this.config.bindToElement('playBackRate', 'input' , 'value','playBackRate')
    this.config.bindToElement('isSound', 'change','checked', 'isSound');
    this.config.bindToElement('isPlayNext', 'change','checked', 'isPlayNext');
    this.config.bindToElement('isFixTimes', 'change','checked', 'isFixTimes');
    this.config.bindToElement('isAutoScroll', 'change','checked', 'isAutoScroll');
    this.config.bindToElement('isInteractive', 'change','checked', 'isInteractive');
    this.config.bindToElement('daysOfWeek', 'change','selectedIndex', 'weekDay');

    document.getElementById('dropdown').innerHTML = SVG_DROPDOWN
    const downloadTimes = document.getElementById('downloadTimes');
    downloadTimes.addEventListener('click',()=> this.prakim.downloadTimes());
    downloadTimes.style.display = this.config.isFixTimes ? 'inline' : 'none';

    this.audioPlayer.addEventListener('ended', () => this.onPerkEnd());
    this.audioPlayer.addEventListener('timeupdate', ()=>this.updateProgress(true));

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
      if (!e.detail.value && this.isinPlayState){
        this.togglePlayState()
      }

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
    this.prakim.onPerkChange = (Perk)=> this.onPerkChange(Perk);
    this.prakim.onTotalTimeLoaded = () =>this.updateProgress();
  }
}




