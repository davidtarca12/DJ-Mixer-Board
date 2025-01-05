let songs = [];
let songsTable;

window.onload = () => {

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

    let leftImg = new Image();
    leftImg.src = "assets/images/channel-red.png";
    let leftAngle = 0;
    let targetSize = 0.3 * leftCanvas.width;

    btnGroups[0].style.left = (leftCanvas.width / 2 - btnGroups[0].offsetWidth / 2) + 'px';
    btnGroups[0].style.top = (leftCanvas.height / 2 - btnGroups[0].offsetHeight + targetSize) + 'px';

    btnGroups[1].style.right = (rightCanvas.width / 2 - btnGroups[0].offsetWidth / 2) + 'px';
    btnGroups[1].style.top = (rightCanvas.height / 2 - btnGroups[0].offsetHeight + targetSize) + 'px';


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
            playLeftImg.src = "assets/buttons/PlayButton.png";

        }
        else{
            leftAngle = animate(leftContext, leftImg, leftAngle, leftCanvas, targetSize, true, true);
            playLeftImg.src = "assets/buttons/StopButton.png";
        }
        leftIsPlaying = !leftIsPlaying;
    }

    playRightBtn.onclick = () => {
        if(rightIsPlaying)
            playRightImg.src = "assets/buttons/PlayButton.png";
        else{
            rightAngle = animate(rightContext, rightImg, rightAngle, rightCanvas, targetSize, false, true);
            playRightImg.src = "assets/buttons/StopButton.png";
        }
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
      
}

function dragOverHandler(ev) {
    ev.preventDefault();
}

function dropHandler(ev) {
    ev.preventDefault();
    if (ev.dataTransfer.items) {

      [...ev.dataTransfer.items].forEach((item, i) => {

        if (item.kind === "file" && item.type === "audio/mpeg") {
          const file = item.getAsFile();
          songs.push(file);
          console.log(songs);
            
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

                const audio = new Audio();

                const objectURL = URL.createObjectURL(file);
                audio.src = objectURL;
                audio.onloadedmetadata = function() {
                    const minutes = Math.floor(audio.duration / 60);
                    const seconds = Math.floor(audio.duration % 60);
                    let duration = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            
                    URL.revokeObjectURL(objectURL);

                    let row = songsTable.insertRow(-1);
                    var headerCell = document.createElement("TH");
                    headerCell.innerHTML = songs.length;
                    row.appendChild(headerCell);
          
                    let titleCell = row.insertCell(-1);
                    titleCell.innerHTML = title;
          
                      let artistCell = row.insertCell(-1);
                      artistCell.innerHTML = artist;
          
                      let durationCell = row.insertCell(-1);
                      durationCell.innerHTML = duration;

                      console.log(songsTable);

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