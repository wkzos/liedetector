let video = document.getElementById('screenVideo');
let stream;
let targetMat;

function onOpenCvReady() {
  console.log("OpenCV.js loaded");

  document.getElementById('shareBtn').onclick = async () => {
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      video.srcObject = stream;

      const targetImg = new Image();
      targetImg.src = 'target.png';
      targetImg.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetImg.width;
        canvas.height = targetImg.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(targetImg, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        targetMat = cv.matFromImageData(imgData);

        detectLoop(); // 시작
      };
    } catch (err) {
      alert('화면 공유 실패: ' + err);
    }
  };
}

function detectLoop() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  setInterval(() => {
    if (!video.videoWidth) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const frameMat = cv.matFromImageData(frame);

    try {
      const result = new cv.Mat();
      cv.matchTemplate(frameMat, targetMat, result, cv.TM_CCOEFF_NORMED);

      const minMax = cv.minMaxLoc(result);
      if (minMax.maxVal > 0.85) {
        alert("이미지 감지됨!");
      }

      frameMat.delete();
      result.delete();
    } catch (e) {
      console.error("OpenCV 오류:", e);
    }
  }, 1000); // 1초마다 감지
}
