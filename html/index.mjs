const GEMATRIA_MAP = {
  0: '', 1: 'א', 2: 'ב', 3: 'ג', 4: 'ד', 5: 'ה', 6: 'ו', 7: 'ז', 8: 'ח', 9: 'ט',
  10: 'י', 20: 'כ', 30: 'ל', 40: 'מ', 50: 'נ', 60: 'ס', 70: 'ע', 80: 'פ',
  90: 'צ', 100: 'ק', 200: 'ר', 300: 'ש', 400: 'ת'
};

const SVG_PLAY = `
 <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="black">
 <polygon points="5,3 19,12 5,21" />
 </svg>`

const SVG_PAUSE = `
 <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
 <rect x="6" y="4" width="4" height="16" />
 <rect x="14" y="4" width="4" height="16" />
 </svg>`

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

class Controller {
  _cachedPerkHTMLs;
  _todaysPerkTimes;
  _todaysPrakim;
  _currentPerk;
  _playBackRate;
  _audioPlayer;
  _perkTable;
  _isSound;

  get todaysPrakim() {
    if (!this._todaysPrakim) {
      const today = new Date();
      const weekday = today.getDay();
      const dailyFromTo = [[1, 29], [30, 50], [51, 72], [73, 89], [90, 106], [107, 119],[120, 150]];
      const [from, to] = dailyFromTo[weekday];
      this._todaysPrakim = Array.from({length: to - from + 1}, ((_, i) => from + i));
      this._todaysPrakim.from = from;
      this._todaysPrakim.to = to;
    }
    return this._todaysPrakim;
  }

  get currentPerk() {
    if (!this._currentPerk) {
      const prakim = this.todaysPrakim;
      let current;
      this._currentPerk = {
        FIRST: prakim.from,
        LAST: prakim.to,
        get NEXT() {
          current = !current ? prakim.from : Math.min(prakim.to, current + 1);
          return current;
        },
        get PREVIOUS() {
          current = !current ? prakim.from : Math.max(prakim.from, current - 1);
          return current;
        },
        get CURRENT() {
          return current;
        },
        set CURRENT(perk) {
          perk = perk ?? 'FIRST';
          if (perk === true) {
            perk = 'NEXT'
          }
          if (perk === false) {
            perk = 'PREVIOUS'
          }
          if (isNaN(perk)) {
            current = this[perk.toUpperCase()];
            if (!current){
              console.log(`perk ${perk} not found`)
            }
          } else {
            current = Math.min(prakim.to, perk);
            current = Math.max(prakim.from, perk);
          }
        },
        set perk(perk) {
          this.CURRENT = perk;
        },
        get perk() {
          return this.CURRENT
        },
        setPerk(perk){
          this.CURRENT = perk;
          return this.CURRENT
        }
      };
    }
    return this._currentPerk;
  }

  get todaysPerkTimes() {
    if (!this._todaysPerkTimes) {
      this._todaysPerkTimes = {total: 0};
      const audios = this.todaysPrakim.map((perk)=>this.getPerkMp3Audio(perk))
      this._todaysPerkTimes.wait = Promise.all(audios)
        .then((audios) =>
          audios.map((audio) => audio.duration))
        .then((durations) => {
          return durations.reduce((acc, duration,i) => {
            acc[i + this.todaysPrakim.from] = acc.total;
            acc.total += duration;
            return acc;
          }, {total: 0})

        })
        .then((totals) => this._todaysPerkTimes = totals);
    }
    return this._todaysPerkTimes;
  }

  get cachedPerkHTMLs() {
    return this._cachedPerkHTMLs ?? (this._cachedPerkHTMLs = {});
  }

  getPerkMp3Name(perk) {
    return `./mp3/${perk.toString().padStart(3, '0')}.mp3`;
  }

  getPerkDataName(perk) {
    return `./prakim/${perk.toString().padStart(3, '0')}.json`;
  }

  getGematria(num) {
    let gematria = [400, 300, 200, 100]
      .reduce((heb, g) => {
        const n = Math.floor(num / g)
        num = num % g
        return heb.padEnd(n, GEMATRIA_MAP[g])
      }, '');
    gematria += "".padEnd(1, GEMATRIA_MAP[Math.floor(num / 10) * 10])
    gematria +=  "".padEnd(1, GEMATRIA_MAP[num % 10])
    return gematria;
  }

  renderPrakimHeader() {
    const prakimHeader = document.getElementById('prakimHeader');
    prakimHeader.innerHTML=
      this.todaysPrakim
        .map(p => `<span id="perk_${p}" class="perk_header" onclick=this.navigate(${p})> ${this.getGematria(p)}</span>`)
        .join(',');
  }

  getPerkMp3Audio(perk) {
    return new Promise((resolve, reject) => {
      const audio = new Audio(this.getPerkMp3Name(perk));
      audio.addEventListener('loadedmetadata', () => {
        resolve(audio)
      }); //e.target.duration
      audio.addEventListener('error', (e)=>{
        console.error(`error loading ${perk}`,e)
        reject(e)
      });
      audio.load();  // Trigger loading of the audio file
    });
  }


  async loadPerkData(perk) {
    return (await fetch(this.getPerkDataName(perk))).json();
  }

  generatePerkTableHTML(perk, lines) {
    const rows = lines.map(line => `
        <tr>
         <td class="row_num">${line.verse}</td>
         <td class="row_txt">${line.text}</td>
       </tr>`
    );
    const tHead = `
        <thead>
            <tr><th colspan="2">פרק ${this.getGematria(perk)} </th></tr>
       </thead>`

    return `
        <table>
            ${tHead}
            <tbody>
                ${rows.join('\n')}
            </tbody>   
        </table>`;

  }

  get playBackRate() {
    return (this._playBackRate ?? (this._playBackRate = document.getElementById('playBackRate')));
  }

  get isSound() {
    return (this._isSound ?? (this._isSound = document.getElementById('isSound')));
  }

  get playBackRateValue() {
    return this.playBackRate.value
  }

  get audioPlayer() {
    return this._audioPlayer ?? (this._audioPlayer = document.getElementById('audioPlayer'));
  }

  get perkTable() {
    return this._perkTable ?? (this._perkTable = document.getElementById('perkTable'));
  }

  async getPerkTable(perk) {
    if (!this.cachedPerkHTMLs[perk]) {
      this.cachedPerkHTMLs[perk] = this.loadPerkData(perk)
        .then((data) => this.generatePerkTableHTML(perk, data.lines));
    }
    return this.cachedPerkHTMLs[perk];
  }

  playPerk(perk) {
      this.audioPlayer.src = this.getPerkMp3Name(perk);
      this.audioPlayer.playbackRate = this.playBackRateValue;
      if(this.isSound.checked) {
        this.audioPlayer.play();
    }
  }

  navigate(perk) {
    perk = this.currentPerk.setPerk(perk)
    this.showPerk(perk);
    this.playPerk(perk)
  }

  showPerk(perk) {
    window.scroll({
      top: 0,
      // behavior: 'smooth' // Optional: Use 'auto' for instant scrolling
    });

    document.querySelectorAll('.perk_header.active').forEach((el) => el.classList.remove('active'));
    document.getElementById(`perk_${perk}`).classList.add('active');

    this.getPerkTable(perk)
      .then(html => this.perkTable.innerHTML = html)
      .catch(console.error);
    return perk
  }

  addListeners() {
    const formatTime = (seconds)=> {
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
    const progress1 = document.getElementById('progress1');
    const progress2 = document.getElementById('progress2');
    const timeDisplay = document.getElementById('timeDisplay');
    const playBtn = document.getElementById('playBtn');
    const isPlayNext = document.getElementById('isPlayNext');

    let playState;

    const updateProgress= () =>{
      if (playState !== this.audioPlayer.paused) {
        playState = this.audioPlayer.paused;
        playBtn.innerHTML = playState? SVG_PLAY : SVG_PAUSE
      }

      const audioPlayerTime = this.audioPlayer.currentTime;
      const audioPlayerDuration = this.audioPlayer.duration;
      const speed = this.playBackRateValue;

      const adjustedDuration = audioPlayerDuration / speed;
      const adjustedPlayTime = audioPlayerTime / speed;
      const totalAdjustedDuration = this.todaysPerkTimes.total / speed;
      const totalAdjustedPlayTime = this.todaysPerkTimes[this.currentPerk.perk] / speed;

      // Calculate the percentage of progress
      const percent1 = ((audioPlayerTime / audioPlayerDuration) * 100) || 0;
      const percent2 = (( (audioPlayerTime + this.todaysPerkTimes[this.currentPerk.perk])/this.todaysPerkTimes.total) * 100) || 0;
      progress1.style.width = percent1 + '%';
      progress2.style.width = percent2 + '%';
      timeDisplay.textContent = `${formatTime(adjustedPlayTime)
      }/${formatTime(adjustedDuration)
      } (${formatTime(totalAdjustedPlayTime)
      }/${formatTime(totalAdjustedDuration )})`;
    }

    const togglePlayState =()=>{
      this.isSound.checked = true
      if (this.audioPlayer.paused) {
        this.currentPerk.perk
          ? this.audioPlayer.play()
          : this.navigate("FIRST");
      } else {
        this.audioPlayer.pause();
      }
    }

    this.isSound.addEventListener('change', (e) => {
      if (!e.target.checked) {
        this.audioPlayer.pause();
        this.audioPlayer.currentTime = 0
      } else if(this.currentPerk.perk){
        this.audioPlayer.play();
      }
    });

    // this.audioPlayer.addEventListener('play',togglePlayPause);
    // this.audioPlayer.addEventListener('pause',togglePlayPause);
    this.audioPlayer.addEventListener('ended', () => {
      isPlayNext.checked && this.navigate(true)
        // : togglePlayPause()
    });
    this.audioPlayer.addEventListener('timeupdate', updateProgress);


    const volumeControl = document.getElementById('volume');
    const volumeLabel = document.getElementById('volumeLabel');

    const speedLabel = document.getElementById('speedLabel');

    volumeControl.addEventListener('input', (e) => {
      this.audioPlayer.volume = e.target.value;
      volumeLabel.textContent = `Volume ${e.target.value}:`;
    })

    this.playBackRate.addEventListener('input', (e) => {
      this.audioPlayer.playbackRate = e.target.value;
      speedLabel.textContent = `Speed ${e.target.value}:`;
      if (this.audioPlayer.paused) {
        updateProgress()
      }
    })

    playBtn.addEventListener('click', togglePlayState);

    const navigateTo = ["FIRST", "PREVIOUS", "NEXT", "LAST"];
    ['firstButton','prevButton','nextButton','lastButton']
      .forEach((buttonId,i)=>{
        const button = document.getElementById(buttonId);
        button.innerHTML = SVG_NAVIGATE_BUTTONS[i];
        // button.setAttribute('data-action', navigateTo[i]);
        button.dataset.action = navigateTo[i];
        button.addEventListener('click', (e) => this.navigate(e.currentTarget.dataset.action));
      });
    this.renderPrakimHeader();

    this.todaysPerkTimes.wait?.then(()=>updateProgress()) ?? updateProgress()

    document.querySelectorAll('.perk_header').forEach((el,i) => {
      el.dataset.perek = this.todaysPrakim[i];
      el.addEventListener('click', (e) => this.navigate(e.currentTarget.dataset.perek*1));

    });

    this.showPerk(this.todaysPrakim.from);
  }
}

export const controller = new Controller()



