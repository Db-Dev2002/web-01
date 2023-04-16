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

analyser.fftSize = 1024;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

const canvas = document.getElementById("equalizer-canvas");
const canvasCtx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

function draw() {
    drawVisual = requestAnimationFrame(draw);

    analyser.getByteFrequencyData(dataArray);

    canvasCtx.fillStyle = "rgb(0, 0, 0)";
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    const totalBars = 512;
    const barHeight = HEIGHT / totalBars;
    let barWidth;
    let y = 0;

    for (let i = 0; i < totalBars; i++) {
        const bufferIndex = Math.floor((i * bufferLength) / totalBars);
        barWidth = dataArray[bufferIndex] * (WIDTH / 256);

        const r = Math.floor(200 * (1 - i / totalBars));
        const b = Math.floor(200 * (i / totalBars));
        const color = `rgb(${r}, 50, ${b})`;

        canvasCtx.fillStyle = color;
        canvasCtx.fillRect(WIDTH - barWidth, y, barWidth, barHeight);

        y += barHeight + 1;
    }
}

draw();
