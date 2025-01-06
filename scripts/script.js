let songs = [];
let songsTable;
let selectedSong = null;
let audioPlayerLeft, audioPlayerRight;

const defaultAudioPlayerSrc = (new Audio()).src;

class Song {
    constructor(file, url, name, artist) {
        this.file = file;
        this.url = url;
        this.name = name;
        this.artist = artist;
    }
}

window.onload = () => {
    let leftCanvas, leftContext,
            rightCanvas, rightContext,
            btnGroups,
            playLeftBtn, playRightBtn,
            playLeftImg, playRightImg,
            uploadLeft, uploadRight,
            leftSongName, rightSongName,
            seekbarLeft, seekbarRight,
            currentTimeLeft, currentTimeRight,
            durationLeft, durationRight,
            previousLeft, previousRight,
            leftSongNameWrapper, rightSongNameWrapper,
            leftSeekBar, rightSeekBar,
            dropZone,
            crossfader;

    initComponents();
    let leftIsPlaying = false, rightIsPlaying = false;
    let leftAngle = 0, rightAngle = 0;
    let targetSize;
    const leftImg = new Image(), rightImg = new Image();

    const audioContext = new AudioContext();
    const trackLeft = audioContext.createMediaElementSource(audioPlayerLeft);
    const leftGainNode = audioContext.createGain();

    const trackRight = audioContext.createMediaElementSource(audioPlayerRight);
    const rightGainNode = audioContext.createGain();

    trackLeft.connect(leftGainNode).connect(audioContext.destination);
    trackRight.connect(rightGainNode).connect(audioContext.destination);
    
    arrangeInPage();
    drawDiscs();

    playLeftBtn.onclick = () => {
        playBtnClicked(audioPlayerLeft, playLeftImg, leftIsPlaying)
    };
    playRightBtn.onclick = () => {
        playBtnClicked(audioPlayerRight, playRightImg, rightIsPlaying)
    }
    playBtnClicked = function(audioPlayer, playImg, isPlayingBool){
        if (isPlayingBool) {
            audioPlayer.pause();
            playImg.src = "assets/buttons/PlayButton.png";
        }
        else {
            if (audioPlayer.src !== defaultAudioPlayerSrc) {
                audioContext.resume();
                audioPlayer.play();
                if(audioPlayer === audioPlayerLeft)
                    animate(leftContext, leftImg, leftAngle, leftCanvas, !isPlayingBool);
                else
                    animate(rightContext, rightImg, rightAngle, rightCanvas, !isPlayingBool);
                playImg.src = "assets/buttons/StopButton.png";
            }
        }
        if (audioPlayer.src !== defaultAudioPlayerSrc){
            if(audioPlayer === audioPlayerLeft)
                leftIsPlaying = !leftIsPlaying;
            else
                rightIsPlaying = !rightIsPlaying;
        }
    }
    
    audioPlayerLeft.onended = () => { hasEnded(leftIsPlaying, playLeftBtn); }
    audioPlayerRight.onended = () => { hasEnded(rightIsPlaying, playRightBtn); }

    crossfader.addEventListener("input", () => {
        leftGainNode.gain.value = ((2 - crossfader.value / 50) <= 1) ? (2 - crossfader.value / 50) : 1; 
        rightGainNode.gain.value = (crossfader.value / 50 <= 1) ? (crossfader.value / 50) : 1;
        
    }, false);

    function hasEnded(isPlaying, playBtn) {
        if(isPlaying)
            playBtn.click()
    }

   dropZone.ondrop = function(){dropHandler(event)};
   dropZone.ondragover = function(){dragOverHandler(event)};

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

                reader.onload = function (e) {
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

                    const audio = new Audio();

                    const objectURL = URL.createObjectURL(file);
                    audio.src = objectURL;
                    audio.onloadedmetadata = function () {
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
                            if (selectedSong !== null) {
                                let index = songs.indexOf(selectedSong);
                                songsTable.rows.item(index + 2).setAttribute('class', 'table-dark');
                            }
                            selectedSong = songs[row.cells[0].innerHTML - 1];
                            row.setAttribute('class', 'table-secondary');
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


    uploadLeft.onclick = () => { uploadSong(audioPlayerLeft, leftSongName, leftSongNameWrapper, leftIsPlaying, playLeftBtn) };
    uploadRight.onclick = () => { uploadSong(audioPlayerRight, rightSongName, rightSongNameWrapper, rightIsPlaying, playRightBtn) };
    
    function uploadSong(audioPlayer, songName, songNameWrapper, isPlaying, playBtn){
        if(selectedSong){
            const objectURL = selectedSong.url;
            audioPlayer.src = objectURL;
            songName.innerHTML = selectedSong.artist + " - " + selectedSong.name;
            resizeSongName(songNameWrapper);
            if (isPlaying)
                playBtn.click();
        }
    }

    seekbarLeft.onchange = function () { seekTo(audioPlayerLeft, seekbarLeft) };
    seekbarRight.onchange = function () { seekTo(audioPlayerRight, seekbarRight) };

    function seekTo(audioPlayer, seekbar) {
        if (!isNaN(audioPlayer.duration))
            audioPlayer.currentTime = audioPlayer.duration * (seekbar.value / 100);
    }

    setInterval(function () { seekUpdate(audioPlayerRight, seekbarRight, currentTimeRight, durationRight) }, 300);
    setInterval(function () { seekUpdate(audioPlayerLeft, seekbarLeft, currentTimeLeft, durationLeft) }, 300);

    function seekUpdate(audioPlayer, seekbar, currentTime, duration) {
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

    function initComponents() {
        audioPlayerLeft = document.createElement('audio');
        audioPlayerRight = document.createElement('audio');
    
        songsTable = document.getElementById('songs-table');
    
        leftCanvas = document.getElementById('left');
        leftContext = leftCanvas.getContext('2d');
    
        rightCanvas = document.getElementById('right');
        rightContext = rightCanvas.getContext('2d');
    
        btnGroups = document.getElementsByClassName('btn-group');
    
        playLeftBtn = document.getElementById('play-left');
        playLeftImg = document.getElementById('play-left-img');
    
        playRightBtn = document.getElementById('play-right');
        playRightImg = document.getElementById('play-right-img');
    
        uploadLeft = document.getElementById('upload-left');
        uploadRight = document.getElementById('upload-right');
    
        leftSongName = document.getElementById('left-song-name');
        rightSongName = document.getElementById('right-song-name');
    
        seekbarLeft = document.getElementById('seekbar-left');
        currentTimeLeft = document.getElementById('current-time-left');
        durationLeft = document.getElementById('duration-left');
    
        seekbarRight = document.getElementById('seekbar-right');
        currentTimeRight = document.getElementById('current-time-right');
        durationRight = document.getElementById('duration-right');
    
        previousRight = document.getElementById('previous-right');
    
        leftSongNameWrapper = document.getElementById('left-song-name-wrapper');
        rightSongNameWrapper = document.getElementById('right-song-name-wrapper');

        leftSeekBar = document.getElementById('audio-controls-left');
        rightSeekBar = document.getElementById('audio-controls-right');

        dropZone = document.getElementById('drop-zone');

        crossfader = document.getElementById('crossfader');
    }

    function arrangeInPage(){
        targetSize = leftCanvas.width;

        leftCanvas.height = rightCanvas.height = document.documentElement.clientHeight * 0.6;
        leftCanvas.width = rightCanvas.width = document.documentElement.clientWidth * 0.4;
        
        leftSeekBar.style.left = (leftCanvas.width / 2 - leftSeekBar.offsetWidth / 2) + 'px';
        leftSeekBar.style.top = (leftCanvas.height / 2 - leftSeekBar.offsetHeight + targetSize - 50) + 'px';
    
        rightSeekBar.style.right = (rightCanvas.width / 2 - rightSeekBar.offsetWidth / 2) + 'px';
        rightSeekBar.style.top = (rightCanvas.height / 2 - rightSeekBar.offsetHeight + targetSize - 50) + 'px';

        btnGroups[0].style.left = (leftCanvas.width / 2 - btnGroups[0].offsetWidth / 2) + 'px';
        btnGroups[0].style.top = (leftCanvas.height / 2 - btnGroups[0].offsetHeight + targetSize - 105) + 'px';
    
        btnGroups[1].style.right = (rightCanvas.width / 2 - btnGroups[0].offsetWidth / 2) + 'px';
        btnGroups[1].style.top = (rightCanvas.height / 2 - btnGroups[0].offsetHeight + targetSize - 105) + 'px';
        
        resizeSongName(leftSongNameWrapper);
        resizeSongName(rightSongNameWrapper);

    }
    
    function resizeSongName(songNameWrapper) {
        const paddingValue = (leftCanvas.width / 2 - songNameWrapper.offsetWidth / 2) + 'px';
        if(songNameWrapper === leftSongNameWrapper)
            songNameWrapper.style.left = paddingValue
        else
            songNameWrapper.style.right = paddingValue;
        songNameWrapper.style.top = (leftCanvas.height / 2 - songNameWrapper.offsetHeight + targetSize - 130) + 'px';
    }

    function drawDiscs(){
        leftImg.src = "assets/images/channel-red.png";
        rightImg.src = "assets/images/channel-blue.png";

        leftCanvas.height = rightCanvas.height = document.documentElement.clientHeight * 0.6;
        leftCanvas.width = rightCanvas.width = document.documentElement.clientWidth * 0.4;
    
        leftImg.onload = () => {
            animate(leftContext, leftImg, leftAngle, leftCanvas, leftIsPlaying);
        }
        rightImg.onload = () => {
            animate(rightContext, rightImg, rightAngle, rightCanvas, rightIsPlaying);
        }
    }

    function animate(ctx, image, angle, canvas, isPlaying) {

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

        if (!isPlaying) {
            if (ctx === leftContext)
                leftAngle = angle;
            else
                rightAngle = angle;
            return;
        }

        angle += 0.01;

        if (ctx === leftContext)
            requestAnimationFrame(() => animate(ctx, image, angle, canvas, leftIsPlaying));
        else
            requestAnimationFrame(() => animate(ctx, image, angle, canvas, rightIsPlaying));

    }
}