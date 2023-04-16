const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const gainNode = audioContext.createGain();
gainNode.connect(audioContext.destination);

const loadBuffer = async (url) => {
    const response = await fetch(url);
    const audioData = await response.arrayBuffer();
    const buffer = await audioContext.decodeAudioData(audioData);
    return buffer;
};

const playNote = async (note) => {
    const source = audioContext.createBufferSource();
    source.buffer = await loadBuffer(`notes/${note}.wav`);
    source.connect(gainNode);
    source.start(0);
};

document.querySelectorAll(".pianoBlackKey, .pianoWhiteKey").forEach((key) => {
    key.addEventListener("mousedown", async (e) => {
        const note = e.target.dataset.note;
        await playNote(note);
    });
});

const analyser = audioContext.createAnalyser();
gainNode.connect(analyser);

analyser.fftSize = 4096;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

analyser.getByteTimeDomainData(dataArray);

const canvas = document.getElementById("canvas");
const canvasCtx = canvas.getContext("2d");
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

function draw() {
    requestAnimationFrame(draw);
    analyser.getByteTimeDomainData(dataArray);
    canvasCtx.fillStyle = "rgb(200, 200, 200)";
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = "rgb(0, 0, 200)";
    canvasCtx.beginPath();

    const sliceWidth = canvas.width / bufferLength;

    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * (HEIGHT / 2);

        if (i === 0) {
            canvasCtx.moveTo(x, y);
        } else {
            canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
    }
    canvasCtx.lineTo(WIDTH, HEIGHT / 2);
    canvasCtx.stroke();
}

draw();
