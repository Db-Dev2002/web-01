import { Midi } from "@tonejs/midi";
import * as Tone from "tone";

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const gainNode = audioContext.createGain();
gainNode.connect(audioContext.destination);

const bufferCache = new Map();

const loadBuffer = async (url) => {
    if (bufferCache.has(url)) {
        console.log(`Cache hit for ${url}`);
        return bufferCache.get(url);
    }

    console.log(`Fetching and caching ${url}`);
    const response = await fetch(url);
    const audioData = await response.arrayBuffer();
    const buffer = await audioContext.decodeAudioData(audioData);

    bufferCache.set(url, buffer);
    return buffer;
};

// const playNote = async (note) => {
//     if (!note) {
//         console.warn("Invalid note name:", note);
//         return;
//     }
//     const buffer = await loadBuffer(`notes/${note}.wav`);
//     const source = audioContext.createBufferSource();
//     source.buffer = buffer;
//     source.connect(gainNode);
//     source.start();
// };

const playNote = async (note) => {
    if (!note) {
        console.warn("Invalid note name:", note);
        return;
    }
    const url = `notes/${note}.wav`;
    const buffer = await loadBuffer(url);
    const player = new Tone.Player(buffer).toDestination();
    player.start();
};

// const playNote = async (note) => {
//     if (!note) {
//         console.warn("Invalid note name:", note);
//         return;
//     }
//
//     const url = `notes/${note}.wav`;
//     console.log(`Play note: ${note}, URL: ${url}`);
//     const player = new Tone.Player(url).toDestination();
//     await player.load();
//     player.start();
// };

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

let drawVisual;

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

const midiNoteToNoteName = (midiNote) => {
    const octave = Math.floor(midiNote / 12) - 1;
    const noteNames = [
        "C",
        "Db",
        "D",
        "Eb",
        "E",
        "F",
        "Gb",
        "G",
        "Ab",
        "A",
        "Bb",
        "B",
    ];
    const index = midiNote % 12;
    const noteName = noteNames[index];

    if (octave >= 1 && octave <= 7) {
        return noteName + octave;
    } else {
        console.log(`Invalid MIDI note: ${midiNote}`);
        return null;
    }
};

const createSampler = async () => {
    const noteMap = {};

    for (let midiNote = 21; midiNote <= 108; midiNote++) {
        const noteName = midiNoteToNoteName(midiNote);
        if (noteName !== null) {
            noteMap[noteName] = `notes/${noteName}.wav`;
        }
    }

    const sampler = new Tone.Sampler(noteMap, {
        onload: () => console.log("Sampler loaded"),
        baseUrl: "",
    }).toDestination();

    return sampler;
};

const loadPianoSamples = async () => {
    const noteMap = {};

    for (let midiNote = 21; midiNote <= 108; midiNote++) {
        const noteName = midiNoteToNoteName(midiNote);
        if (noteName !== null) {
            noteMap[noteName] = `notes/${noteName}.wav`; // Make sure you adjust the path to your samples
        }
    }

    const polyPiano = new Tone.PolySynth(Tone.Sampler, {
        onload: () => console.log("Piano loaded"),
        baseUrl: "",
        urls: noteMap,
    }).toDestination();

    return polyPiano;
};

const polyPiano = await loadPianoSamples();

const test = async () => {
    // Trigger multiple notes at once
    polyPiano.triggerAttack(["C4", "E4", "G4"]);
    setTimeout(() => {
        polyPiano.triggerRelease(["C4", "E4", "G4"]);
    }, 1000);
};

const playButton = document.getElementById("play-midi");

playButton.addEventListener("click", async () => {
    await Tone.start();
    // loadAndPlayMIDIFile("midi/UNSORTED MIDI/Linkin Park - Crawling.mid");
    // loadAndPlayMIDIFile("bella_ciao.mid");
    await test();
});

// const loadAndPlayMIDIFile = async (url) => {
//     const response = await fetch(url);
//     const midiData = await response.arrayBuffer();
//     const midiFile = new Midi(midiData);
//
//     // Adjust playback speed
//     Tone.Transport.bpm.value = midiFile.header.tempos[0].bpm * 0.1;
//
//     const noteSet = new Set();
//
//     midiFile.tracks.forEach((track) => {
//         track.notes.forEach((note) => {
//             const noteName = midiNoteToNoteName(note.midi);
//             if (noteName) {
//                 noteSet.add(noteName);
//             }
//         });
//     });
//
//     const noteLoadingPromises = Array.from(noteSet)
//         .filter((noteName) => noteName !== null)
//         .map(async (noteName) => {
//             const buffer = new Tone.Buffer();
//             await buffer.load(`notes/${noteName}.wav`);
//             Tone.Buffer.loaded().then(() => {
//                 bufferCache.set(noteName, buffer);
//             });
//         });
//
//     await Promise.all(noteLoadingPromises);
//
//     midiFile.tracks.forEach((track) => {
//         const notes = track.notes
//             .map((note) => {
//                 const noteName = midiNoteToNoteName(note.midi);
//                 return {
//                     time: note.time,
//                     name: noteName,
//                     duration: note.duration + 0.28,
//                 };
//             })
//             .filter((note) => note.name !== null);
//
//         const part = new Tone.Part((time, value) => {
//             if (!value.name) {
//                 console.warn("Invalid note name:", value.name);
//                 return;
//             }
//
//             const buffer = bufferCache.get(value.name);
//             const player = new Tone.Player(buffer).toDestination();
//             player.sync().start(time, 0, value.duration);
//         }, notes).start(0);
//     });
//
//     Tone.Transport.start();
// };

const loadAndPlayMIDIFile = async (url) => {
    const response = await fetch(url);
    const midiData = await response.arrayBuffer();
    const midiFile = new Midi(midiData);

    // Adjust playback speed
    // Tone.Transport.bpm.value = midiFile.header.tempos[0].bpm * 0.1;

    const sampler = await createSampler();

    midiFile.tracks.forEach((track) => {
        const notes = track.notes
            .map((note) => {
                const noteName = midiNoteToNoteName(note.midi);
                return {
                    time: note.time,
                    name: noteName,
                    duration: note.duration + 0.32,
                };
            })
            .filter((note) => note.name !== null);

        const part = new Tone.Part((time, value) => {
            if (!value.name) {
                console.warn("Invalid note name:", value.name);
                return;
            }

            sampler.triggerAttackRelease(value.name, value.duration, time);
        }, notes).start(0);
    });

    Tone.Transport.start();
};

const playMidiButton = document.getElementById("play-midi");

playMidiButton.addEventListener("click", async () => {
    await Tone.start();
    loadAndPlayMIDIFile("lk.mid");
    // loadAndPlayMIDIFile("bella_ciao.mid");
});
