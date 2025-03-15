function createTrackItem(index, name, duration) {
  var trackItem = document.createElement('div');
  trackItem.setAttribute("class", "playlist-track-ctn");
  trackItem.setAttribute("id", "ptc-" + index);
  trackItem.setAttribute("data-index", index);
  document.querySelector(".playlist-ctn").appendChild(trackItem);

  var playBtnItem = document.createElement('div');
  playBtnItem.setAttribute("class", "playlist-btn-play");
  playBtnItem.setAttribute("id", "pbp-" + index);
  document.querySelector("#ptc-" + index).appendChild(playBtnItem);

  var btnImg = document.createElement('i');
  btnImg.setAttribute("class", "fas fa-play");
  btnImg.setAttribute("height", "40");
  btnImg.setAttribute("width", "40");
  btnImg.setAttribute("id", "p-img-" + index);
  document.querySelector("#pbp-" + index).appendChild(btnImg);

  var trackInfoItem = document.createElement('div');
  trackInfoItem.setAttribute("class", "playlist-info-track");
  trackInfoItem.innerHTML = name;
  document.querySelector("#ptc-" + index).appendChild(trackInfoItem);

  var trackDurationItem = document.createElement('div');
  trackDurationItem.setAttribute("class", "playlist-duration");
  trackDurationItem.innerHTML = duration;
  document.querySelector("#ptc-" + index).appendChild(trackDurationItem);
}

let listAudio = [];
let originalListAudio = [];
var indexAudio = 0;
let loopMode = 'none';
let shuffleMode = false;

document.getElementById('audioFiles').addEventListener('change', function(event) {
  listAudio = [];
  originalListAudio = [];
  document.querySelector(".playlist-ctn").innerHTML = "";
  const files = event.target.files;

  for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const audio = new Audio(URL.createObjectURL(file));
      
      audio.onloadedmetadata = function() {
          const duration = getMinutes(audio.duration);
          const track = {
              name: file.name.replace('.mp3', '').trim(),
              file: URL.createObjectURL(file),
              duration: duration
          };
          listAudio.push(track);
          originalListAudio.push(track);

          if (listAudio.length === files.length) {
              listAudio.forEach((track, idx) => createTrackItem(idx, track.name, track.duration));
              loadNewTrack(0);
          }
      };
  }
});

function loadNewTrack(index) {
  var player = document.querySelector('#source-audio');
  player.src = listAudio[index].file;
  document.querySelector('.title').innerHTML = listAudio[index].name;
  this.currentAudio = document.getElementById("myAudio");
  this.currentAudio.load();
  document.getElementsByClassName('duration')[0].innerHTML = listAudio[index].duration; // Set total duration
  this.toggleAudio();
  this.updateStylePlaylist(this.indexAudio, index);
  this.indexAudio = index;
}

var playListItems = document.querySelectorAll(".playlist-track-ctn");

function refreshPlaylistListeners() {
  playListItems = document.querySelectorAll(".playlist-track-ctn");
  for (let i = 0; i < playListItems.length; i++) {
      playListItems[i].removeEventListener("click", getClickedElement.bind(this));
      playListItems[i].addEventListener("click", getClickedElement.bind(this));
  }
}

function getClickedElement(event) {
  for (let i = 0; i < playListItems.length; i++) {
      if (playListItems[i] == event.target) {
          var clickedIndex = event.target.getAttribute("data-index");
          if (clickedIndex == this.indexAudio) {
              this.toggleAudio();
          } else {
              loadNewTrack(clickedIndex);
          }
      }
  }
}

var currentAudio = document.getElementById("myAudio");
var timer = document.getElementsByClassName('timer')[0];

function toggleAudio() {
  if (this.currentAudio.paused) {
      document.querySelector('#icon-play').style.display = 'none';
      document.querySelector('#icon-pause').style.display = 'block';
      document.querySelector('#ptc-' + this.indexAudio).classList.add("active-track");
      this.playToPause(this.indexAudio);
      this.currentAudio.play();
      refreshPlaylistListeners();
  } else {
      document.querySelector('#icon-play').style.display = 'block';
      document.querySelector('#icon-pause').style.display = 'none';
      this.pauseToPlay(this.indexAudio);
      this.currentAudio.pause();
  }
}

function onTimeUpdate() {
  var t = this.currentAudio.currentTime;
  timer.innerHTML = getMinutes(t); // Update current time
  this.setBarProgress();
  if (this.currentAudio.ended) {
      document.querySelector('#icon-play').style.display = 'block';
      document.querySelector('#icon-pause').style.display = 'none';
      this.pauseToPlay(this.indexAudio);
      if (loopMode === 'one') {
          this.loadNewTrack(this.indexAudio);
      } else if (loopMode === 'all' && this.indexAudio === listAudio.length - 1) {
          this.loadNewTrack(0);
      } else if (shuffleMode) {
          this.playNextShuffled();
      } else if (this.indexAudio < listAudio.length - 1) {
          this.next();
      }
  }
}

function setBarProgress() {
  var progress = (this.currentAudio.currentTime / this.currentAudio.duration) * 100;
  document.getElementById("myBar").style.width = progress + "%";
}

function getMinutes(t) {
  var min = parseInt(t / 60);
  var sec = parseInt(t % 60);
  if (sec < 10) sec = "0" + sec;
  if (min < 10) min = "0" + min;
  return min + ":" + sec;
}

var progressbar = document.querySelector('#myProgress');
progressbar.addEventListener("click", seek.bind(this));

function seek(event) {
  var percent = event.offsetX / progressbar.offsetWidth;
  this.currentAudio.currentTime = percent * this.currentAudio.duration;
  setBarProgress(); // Update bar immediately after seeking
}

function forward() {
  this.currentAudio.currentTime = Math.min(this.currentAudio.currentTime + 5, this.currentAudio.duration);
  setBarProgress();
}

function rewind() {
  this.currentAudio.currentTime = Math.max(this.currentAudio.currentTime - 5, 0);
  setBarProgress();
}

function next() {
  if (this.indexAudio < listAudio.length - 1) {
      var oldIndex = this.indexAudio;
      this.indexAudio++;
      updateStylePlaylist(oldIndex, this.indexAudio);
      this.loadNewTrack(this.indexAudio);
  } else if (loopMode === 'all') {
      this.loadNewTrack(0);
  }
}

function previous() {
  if (this.indexAudio > 0) {
      var oldIndex = this.indexAudio;
      this.indexAudio--;
      updateStylePlaylist(oldIndex, this.indexAudio);
      this.loadNewTrack(this.indexAudio);
  }
}

function updateStylePlaylist(oldIndex, newIndex) {
  document.querySelector('#ptc-' + oldIndex).classList.remove("active-track");
  this.pauseToPlay(oldIndex);
  document.querySelector('#ptc-' + newIndex).classList.add("active-track");
  this.playToPause(newIndex);
}

function playToPause(index) {
  var ele = document.querySelector('#p-img-' + index);
  ele.classList.remove("fa-play");
  ele.classList.add("fa-pause");
}

function pauseToPlay(index) {
  var ele = document.querySelector('#p-img-' + index);
  ele.classList.remove("fa-pause");
  ele.classList.add("fa-play");
}

function toggleMute() {
  var btnMute = document.querySelector('#toggleMute');
  var volUp = document.querySelector('#icon-vol-up');
  var volMute = document.querySelector('#icon-vol-mute');
  if (this.currentAudio.muted == false) {
      this.currentAudio.muted = true;
      volUp.style.display = "none";
      volMute.style.display = "block";
  } else {
      this.currentAudio.muted = false;
      volMute.style.display = "none";
      volUp.style.display = "block";
  }
}

function toggleLoop() {
  const loopBtn = document.getElementById('loop-btn');
  if (loopMode === 'none') {
      loopMode = 'one';
      loopBtn.classList.add('active-loop-one');
      loopBtn.classList.remove('active-loop-all');
  } else if (loopMode === 'one') {
      loopMode = 'all';
      loopBtn.classList.remove('active-loop-one');
      loopBtn.classList.add('active-loop-all');
  } else {
      loopMode = 'none';
      loopBtn.classList.remove('active-loop-one');
      loopBtn.classList.remove('active-loop-all');
  }
}

function toggleShuffle() {
  const shuffleBtn = document.getElementById('shuffle-btn');
  shuffleMode = !shuffleMode;
  if (shuffleMode) {
      shuffleBtn.classList.add('active-shuffle');
      shuffleArray(listAudio);
      updatePlaylistIndices();
  } else {
      shuffleBtn.classList.remove('active-shuffle');
      listAudio = [...originalListAudio];
      updatePlaylistIndices();
  }
  this.indexAudio = 0;
  loadNewTrack(this.indexAudio);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
}

function updatePlaylistIndices() {
  document.querySelector(".playlist-ctn").innerHTML = "";
  listAudio.forEach((track, idx) => createTrackItem(idx, track.name, track.duration));
  refreshPlaylistListeners();
}

function playNextShuffled() {
  if (this.indexAudio < listAudio.length - 1) {
      this.next();
  } else if (loopMode === 'all') {
      this.loadNewTrack(0);
  }
}