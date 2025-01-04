window.onload = () => {
    let leftCanvas = document.getElementById('left');
    let leftContext = leftCanvas.getContext('2d');

    let rightCanvas = document.getElementById('right');
    let rightContext = rightCanvas.getContext('2d');

    leftCanvas.height = rightCanvas.height = document.documentElement.clientWidth * 0.6;
    leftCanvas.width = rightCanvas.width = document.documentElement.clientWidth * 0.4;

    

    let centerCanvas = document.getElementById('center');
    let centerContext = centerCanvas.getContext('2d');

    let leftImg = new Image();
    leftImg.src = "assets/images/channel-red.png";
    let leftAngle = 0;
    let targetWidth = window.innerWidth * 0.225;
    let targetHeight = window.innerHeight * 0.3;

    leftImg.onload = () => {
        leftContext.drawImage(leftImg, leftCanvas.width/2 - targetWidth/2,leftCanvas.height / 2 - targetHeight / 1.2, targetWidth, targetHeight);
        animate(leftContext, leftImg, leftAngle, leftCanvas, targetWidth, targetHeight);
    }

    let rightImg = new Image();
    rightImg.src = "assets/images/channel-blue.png";
    let rightAngle = 0;
    rightImg.onload = () => {
        rightContext.drawImage(rightImg, rightCanvas.width/2 - targetWidth/2, rightCanvas.height/2 - targetHeight / 1.2, targetWidth, targetHeight);
        animate(rightContext, rightImg, rightAngle, rightCanvas, targetWidth, targetHeight);
    }
}

function animate(ctx, image, angle, canvas, targetWidth, targetHeight) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);  

    ctx.save(); 
    ctx.translate(canvas.width / 2, canvas.height / 2.8);
    ctx.rotate(angle);

    ctx.drawImage(
        image,
        -targetWidth / 2,
        -targetHeight / 2,
        targetWidth,
        targetHeight
    );

    ctx.restore();
    
    angle += 0.01;
    
    requestAnimationFrame(() => animate(ctx, image, angle, canvas, targetWidth, targetHeight));
}