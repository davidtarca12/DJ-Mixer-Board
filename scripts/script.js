let songs = [];
let songsTable;
let selectedSong = null;
let audioPlayerLeft, audioPlayerRight;
const defaultAudioPlayerSrc = (new Audio()).src;

class Song{
    constructor(file, url, name, artist){
        this.file = file;
        this.url = url;
        this.name = name;
        this.artist = artist;
    }
}

window.onload = () => {
    audioPlayerLeft = document.createElement('audio');
    audioPlayerRight = document.createElement('audio');

    let leftCanvas = document.getElementById('left');
    let leftContext = leftCanvas.getContext('2d');

    let rightCanvas = document.getElementById('right');
    let rightContext = rightCanvas.getContext('2d');

    let btnGroups = document.getElementsByClassName('btn-group');

    leftCanvas.height = rightCanvas.height = document.documentElement.clientHeight * 0.6;
    leftCanvas.width = rightCanvas.width = document.documentElement.clientWidth * 0.4;

    let playLeftBtn = document.getElementById('play-left');
    let playLeftImg = document.getElementById('play-left-img');
    let playRightBtn = document.getElementById('play-right');
    let playRightImg = document.getElementById('play-right-img');

    let leftIsPlaying = false, rightIsPlaying = false;

    songsTable = document.getElementById('songs-table');
    

    let centerCanvas = document.getElementById('center');
    let centerContext = centerCanvas.getContext('2d');

    let uploadLeft = document.getElementById('upload-left');
    let uploadRight = document.getElementById('upload-right');

    let leftSongName = document.getElementById('left-song-name');
    let rightSongName = document.getElementById('right-song-name');


    const seekbarLeft = document.getElementById('seekbar-left');
    const currentTimeLeft = document.getElementById('current-time-left');
    const durationLeft = document.getElementById('duration-left');

    const seekbarRight = document.getElementById('seekbar-right');
    const currentTimeRight = document.getElementById('current-time-right');
    const durationRight = document.getElementById('duration-right');
    
    const previousRight = document.getElementById('previous-right');

    let leftImg = new Image();
    leftImg.src = "assets/images/channel-red.png";
    let leftAngle = 0;
    let targetSize = 0.3 * leftCanvas.width;

    btnGroups[0].style.left = (leftCanvas.width / 2 - btnGroups[0].offsetWidth / 2) + 'px';
    btnGroups[0].style.top = (leftCanvas.height / 2 - btnGroups[0].offsetHeight + targetSize) + 'px';

    btnGroups[1].style.right = (rightCanvas.width / 2 - btnGroups[0].offsetWidth / 2) + 'px';
    btnGroups[1].style.top = (rightCanvas.height / 2 - btnGroups[0].offsetHeight + targetSize) + 'px';

    let leftSongNameWrapper = document.getElementById('left-song-name-wrapper');
    let rightSongNameWrapper = document.getElementById('right-song-name-wrapper');

    resizeSongName(true);
    resizeSongName(false);

    function resizeSongName(left){
        if(left){
            leftSongNameWrapper.style.left = (leftCanvas.width / 2 - leftSongNameWrapper.offsetWidth / 2) + 'px';
            leftSongNameWrapper.style.top = (leftCanvas.height / 2 - leftSongNameWrapper.offsetHeight + targetSize - 50) + 'px';
        }
        else{
            rightSongNameWrapper.style.right = (rightCanvas.width / 2 - rightSongNameWrapper.offsetWidth / 2) + 'px';
            rightSongNameWrapper.style.top = (rightCanvas.height / 2 - rightSongNameWrapper.offsetHeight + targetSize - 50) + 'px';
        }
    }

    let leftSeekBar = document.getElementById('audio-controls-left');
    let rightSeekBar = document.getElementById('audio-controls-right');

    leftSeekBar.style.left = (leftCanvas.width / 2 - leftSeekBar.offsetWidth / 2) +'px';
    leftSeekBar.style.top = (leftCanvas.height / 2 - leftSeekBar.offsetHeight + targetSize + 55) + 'px';

    rightSeekBar.style.right = (rightCanvas.width / 2 - rightSeekBar.offsetWidth / 2) + 'px';
    rightSeekBar.style.top = (rightCanvas.height / 2 - rightSeekBar.offsetHeight + targetSize + 55) + 'px';


    //ANIMATION

    leftImg.onload = () => {
        animate(leftContext, leftImg, leftAngle, leftCanvas, targetSize, true, leftIsPlaying);
    }

    let rightImg = new Image();
    rightImg.src = "assets/images/channel-blue.png";
    let rightAngle = 0;

    rightImg.onload = () => {
        animate(rightContext, rightImg, rightAngle, rightCanvas, targetSize, false, rightIsPlaying);
    }



    playLeftBtn.onclick = () => {
        if(leftIsPlaying){
            audioPlayerLeft.pause();
            playLeftImg.src = "assets/buttons/PlayButton.png";

        }
        else{
            if(audioPlayerLeft.src !== defaultAudioPlayerSrc){
                audioPlayerLeft.play();
                animate(leftContext, leftImg, leftAngle, leftCanvas, targetSize, true, true);
                playLeftImg.src = "assets/buttons/StopButton.png";
            }
        }
        if(audioPlayerLeft.src !== defaultAudioPlayerSrc)
            leftIsPlaying = !leftIsPlaying;
    }

    playRightBtn.onclick = () => {
        if(rightIsPlaying){
            audioPlayerRight.pause();
            playRightImg.src = "assets/buttons/PlayButton.png";
        }
        else{
            if(audioPlayerRight.src !== defaultAudioPlayerSrc){
                audioPlayerRight.play();
                animate(rightContext, rightImg, rightAngle, rightCanvas, targetSize, false, true);
                playRightImg.src = "assets/buttons/StopButton.png";
            }
        }
        if(audioPlayerRight.src !== defaultAudioPlayerSrc)
            rightIsPlaying = !rightIsPlaying;
    }

    function animate(ctx, image, angle, canvas, targetSize, left, isPlaying) {

        ctx.clearRect(0, 0, canvas.width, canvas.height);  
    
        ctx.save(); 
        ctx.translate(canvas.width / 2, canvas.height / 2.8);
        ctx.rotate(angle);
    
        ctx.drawImage(
            image,
            -targetSize / 2,
            -targetSize / 2,
            targetSize,
            targetSize
        );
    
        ctx.restore();

        if(!isPlaying){
            if(left)
                leftAngle = angle;
            else
                rightAngle = angle;
            return;
        }
        
        angle += 0.01;
        
        if(left)
            requestAnimationFrame(() => animate(ctx, image, angle, canvas, targetSize, true, leftIsPlaying));
        else
            requestAnimationFrame(() => animate(ctx, image, angle, canvas, targetSize, false, rightIsPlaying));
        
    }

    uploadLeft.onclick = () => {
        if (selectedSong) {
            const objectURL = selectedSong.url;
            audioPlayerLeft.src = objectURL;
            leftSongName.innerHTML = selectedSong.artist + " - " + selectedSong.name;
            resizeSongName(true);
            if(leftIsPlaying)
                playLeftBtn.onclick();
        }
    };
      
    uploadRight.onclick = () => {
        if (selectedSong) {
            const objectURL = selectedSong.url;
            audioPlayerRight.src = objectURL;
            rightSongName.innerHTML = selectedSong.artist + " - " + selectedSong.name;
            resizeSongName(false);
            if(rightIsPlaying)
                playRightBtn.onclick();
        }
    };

    seekbarLeft.onchange = function() {seekTo(audioPlayerLeft, seekbarLeft)};
    seekbarRight.onchange = function() {seekTo(audioPlayerRight, seekbarRight)};

    setInterval(function() {seekUpdate(audioPlayerRight, seekbarRight, currentTimeRight, durationRight)}, 300);
    setInterval(function() {seekUpdate(audioPlayerLeft, seekbarLeft, currentTimeLeft, durationLeft)}, 300);


    previousRight.onclick = () => {
        
    }
}

function seekTo(audioPlayer, seekbar){
    if(!isNaN(audioPlayer.duration))
        audioPlayer.currentTime = audioPlayer.duration * (seekbar.value / 100);
}

function seekUpdate(audioPlayer, seekbar, currentTime, duration){
    let seekPosition = 0;
    if (!isNaN(audioPlayer.duration)) {
      seekPosition = audioPlayer.currentTime * (100 / audioPlayer.duration);
      seekbar.value = seekPosition;
   
      let currentMinutes = Math.floor(audioPlayer.currentTime / 60);
      let currentSeconds = Math.floor(audioPlayer.currentTime - currentMinutes * 60);
      let durationMinutes = Math.floor(audioPlayer.duration / 60);
      let durationSeconds = Math.floor(audioPlayer.duration - durationMinutes * 60);
   
      if (currentSeconds < 10) { currentSeconds = "0" + currentSeconds; }
      if (durationSeconds < 10) { durationSeconds = "0" + durationSeconds; }
      if (currentMinutes < 10) { currentMinutes = "0" + currentMinutes; }
      if (durationMinutes < 10) { durationMinutes = "0" + durationMinutes; }

      currentTime.textContent = currentMinutes + ":" + currentSeconds;
      duration.textContent = durationMinutes + ":" + durationSeconds;
    }
}

//DRAG AND DROP

function dragOverHandler(ev) {
    ev.preventDefault();
}

function dropHandler(ev) {
    ev.preventDefault();
    if (ev.dataTransfer.items) {

      [...ev.dataTransfer.items].forEach((item, i) => {

        if (item.kind === "file" && item.type === "audio/mpeg") {
          const file = item.getAsFile();
            
          const reader = new FileReader();

          reader.onload = function(e) {
              const arrayBuffer = this.result;
              const dv = new DataView(arrayBuffer);
    
              const tagPosition = dv.byteLength - 128;

              let title = "No title found";
              let artist = "No artist found";
    
              if (dv.getUint8(tagPosition) === 84 &&
                  dv.getUint8(tagPosition + 1) === 65 &&
                  dv.getUint8(tagPosition + 2) === 71) {
      
                  title = getStringFromDataView(dv, tagPosition + 3, 30) || title;
                  artist = getStringFromDataView(dv, tagPosition + 33, 30) || artist;
                  
              }
              console.log(title);

                const audio = new Audio();

                const objectURL = URL.createObjectURL(file);
                audio.src = objectURL;
                audio.onloadedmetadata = function() {
                    const minutes = Math.floor(audio.duration / 60);
                    const seconds = Math.floor(audio.duration % 60);
                    let duration = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

                    let row = songsTable.insertRow(-1);
                    var headerCell = document.createElement("TH");
                    headerCell.innerHTML = songs.length + 1;
                    headerCell.setAttribute('scope', 'row');
                    row.appendChild(headerCell);
          
                    let titleCell = row.insertCell(-1);
                    titleCell.innerHTML = title;
          
                      let artistCell = row.insertCell(-1);
                      artistCell.innerHTML = artist;
          
                      let durationCell = row.insertCell(-1);
                      durationCell.innerHTML = duration;

                      row.onclick = (ev) => {
                        ev.preventDefault();
                        if(selectedSong !== null){
                            let index = songs.indexOf(selectedSong);
                            songsTable.rows.item(index + 2).setAttribute('class', 'table-dark');
                        }
                        selectedSong = songs[row.cells[0].innerHTML - 1];
                        row.setAttribute('class', 'table-secondary');
                        console.log(selectedSong);
                      }
                     
                    songs.push(new Song(file, objectURL, title, artist));
                };

          };
          reader.readAsArrayBuffer(file);
        }
      });
    }
  }


function getStringFromDataView(dv, start, length) {
    let str = "";
    for (let i = start; i < start + length; i++) {
        str += String.fromCharCode(dv.getUint8(i));
    }
    return str.trim();
}