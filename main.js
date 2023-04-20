import { Midi } from "@tonejs/midi";
import * as Tone from "tone";

function createAnalyzer(fftSize = 2048) {
    const audioContext = Tone.context.rawContext;
    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = fftSize;
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    return { analyzer, dataArray };
}

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

    if (octave >= 0 && octave <= 8) {
        return noteName + octave;
    } else {
        console.log(`Invalid MIDI note: ${midiNote}`);
        return null;
    }
};

const playMP3 = async (url) => {
    await initSampler(url);

    if (!sampler.player || !sampler.player.loaded) {
        console.warn("MP3 not loaded yet");
        return;
    }

    if (!isPlaying) {
        togglePlayPause();
    }
};

const createSampler = async (mp3Url = null) => {
    const noteMap = {};

    for (let midiNote = 21; midiNote <= 108; midiNote++) {
        const noteName = midiNoteToNoteName(midiNote);
        if (noteName !== null) {
            noteMap[noteName] = `notes/${noteName}_trimmed.wav`;
        }
    }

    const sampler = new Tone.Sampler(noteMap, {
        onload: () => {
            console.log("Sampler loaded");
        },
        baseUrl: "",
    }).toDestination();

    const { analyzer: equalizerAnalyzer, dataArray: equalizerDataArray } =
        createAnalyzer();
    const { analyzer: waveformAnalyzer, dataArray: waveformDataArray } =
        createAnalyzer(4096 * 8);
    sampler.connect(equalizerAnalyzer);
    sampler.connect(waveformAnalyzer);
    sampler.toDestination();

    if (mp3Url) {
        const buffer = await Tone.Buffer.fromUrl(mp3Url);
        const player = new Tone.Player(buffer).toDestination();
        player.connect(equalizerAnalyzer);
        player.connect(waveformAnalyzer);
        player.toDestination();
        sampler.player = player;

        return {
            sampler,
            equalizerAnalyzer,
            equalizerDataArray,
            waveformAnalyzer,
            waveformDataArray,
            player,
        };
    }

    return {
        sampler,
        equalizerAnalyzer,
        equalizerDataArray,
        waveformAnalyzer,
        waveformDataArray,
    };
};

let sampler,
    equalizerAnalyzer,
    equalizerDataArray,
    waveformAnalyzer,
    waveformDataArray,
    currentMp3Url;
const initSampler = async (mp3Url) => {
    const loadingIndicator = document.getElementById("loading");

    if (!sampler || (mp3Url && mp3Url !== currentMp3Url)) {
        if (sampler) {
            sampler.dispose();
        }
        const result = await createSampler(mp3Url);
        sampler = result.sampler;
        equalizerAnalyzer = result.equalizerAnalyzer;
        equalizerDataArray = result.equalizerDataArray;
        waveformAnalyzer = result.waveformAnalyzer;
        waveformDataArray = result.waveformDataArray;
        currentMp3Url = mp3Url;
    }
    loadingIndicator.style.display = "none";

    drawEqualizer();
    drawWaveform();
};

const playNote = async (note) => {
    await initSampler();

    if (!note) {
        console.warn("Invalid note name:", note);
        return;
    }

    // if (!sampler.loaded) {
    //     console.warn("Sampler not loaded yet");
    //     return;
    // }

    sampler.triggerAttackRelease(note, "8n");
};

const drawEqualizer = () => {
    const canvas = document.getElementById("equalizer-canvas");
    const canvasCtx = canvas.getContext("2d");
    const bufferLength = equalizerAnalyzer.frequencyBinCount;

    function draw() {
        equalizerAnalyzer.getByteFrequencyData(equalizerDataArray);

        canvasCtx.fillStyle = "rgba(30, 38, 48, 0.2)";
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            barHeight = equalizerDataArray[i];

            canvasCtx.fillStyle = "rgb(" + barHeight * 1.1 + ", 0, 100)";
            canvasCtx.fillRect(
                x,
                canvas.height - barHeight / 2,
                barWidth,
                barHeight / 2
            );

            x += barWidth + 1;
        }

        requestAnimationFrame(draw);
    }

    draw();
};

const drawWaveform = () => {
    const canvas = document.getElementById("wave-canvas");
    const canvasCtx = canvas.getContext("2d");

    const container = canvas.parentNode;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const bufferLength = waveformAnalyzer.fftSize;

    function draw() {
        waveformAnalyzer.getByteTimeDomainData(waveformDataArray);

        canvasCtx.fillStyle = "rgba(30, 38, 48, 0.2)";
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

        canvasCtx.lineWidth = 0;
        canvasCtx.strokeStyle = "rgb(10, 255, 90)";
        canvasCtx.beginPath();

        const sliceWidth = (canvas.width * 1.0) / (bufferLength * 0.5);
        let x = 0;

        const yOffset = canvas.height * -0.2;

        for (let i = 0; i < bufferLength; i++) {
            const v = waveformDataArray[i] / 128.0;
            const y = v * canvas.height * 0.75 + yOffset;

            if (i === 0) {
                canvasCtx.moveTo(x, y);
            } else {
                canvasCtx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        canvasCtx.lineTo(canvas.width, canvas.height * 0.5 + yOffset);
        canvasCtx.stroke();

        requestAnimationFrame(draw);
    }

    draw();
};

document.querySelectorAll(".pianoBlackKey, .pianoWhiteKey").forEach((key) => {
    key.addEventListener("mousedown", async (e) => {
        e.preventDefault();
        const note = e.target.dataset.note;
        await Tone.start();
        await initSampler();
        playNote(note);
    });
});

const getKeyElementForNote = (note) => {
    return document.querySelector(`[data-note="${note}"]`);
};

const loadAndPlayMIDIFile = async (url) => {
    await initSampler();

    const response = await fetch(url);
    const midiData = await response.arrayBuffer();
    const midiFile = new Midi(midiData);

    const combinedNotes = [];

    midiFile.tracks.forEach((track) => {
        track.notes.forEach((note) => {
            const noteName = midiNoteToNoteName(note.midi);
            if (noteName !== null) {
                combinedNotes.push({
                    time: note.time,
                    name: noteName,
                    duration: note.duration + 0.04,
                });
            }
        });
    });

    // Sort the combined notes by time
    combinedNotes.sort((a, b) => a.time - b.time);

    const part = new Tone.Part((time, value) => {
        if (!value.name) {
            console.warn("Invalid note name:", value.name);
            return;
        }

        const keyElement = getKeyElementForNote(value.name);
        if (!keyElement) {
            console.warn("No key element found for note:", value.name);
            return;
        }

        keyElement.classList.add("playing");
        setTimeout(
            () => keyElement.classList.remove("playing"),
            value.duration * 1000
        );

        sampler.triggerAttackRelease(value.name, value.duration, time);
    }, combinedNotes).start(0);

    Tone.Transport.start();
    togglePlayPause();
};

document.getElementById("import-mp3").addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "audio/mp3";
    input.onchange = (event) => {
        const file = event.target.files[0];
        const url = URL.createObjectURL(file);
        playMP3(url);
    };
    input.click();
});

document.getElementById("import-midi").addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".mid";
    input.onchange = async (event) => {
        const file = event.target.files[0];
        const url = URL.createObjectURL(file);
        loadAndPlayMIDIFile(url);
    };
    input.click();
});

document.getElementById("play-pause").addEventListener("click", () => {
    togglePlayPause();
});

let isPlaying = false;

let currentPlaybackTime = 0;
const togglePlayPause = () => {
    if (!sampler) {
        console.warn("Sampler not initialized.");
        return;
    }

    isPlaying = !isPlaying;

    if (isPlaying) {
        if (sampler.player && sampler.player.loaded) {
            sampler.player.start(Tone.now(), currentPlaybackTime);
        } else {
            Tone.Transport.start();
        }
        document.getElementById("play-pause").innerHTML = "&#10074;&#10074;";
    } else {
        if (sampler.player && sampler.player.loaded) {
            currentPlaybackTime = sampler.player.toSeconds(
                sampler.player.buffer.duration * sampler.player.progress
            );
            sampler.player.pause();
        } else {
            Tone.Transport.pause();
        }
        document.getElementById("play-pause").innerHTML = "&#9658;";
    }
};

// const playMidiButton = document.getElementById("play-midi");

// playMidiButton.addEventListener("click", async () => {
// const mp3Url = "s.mp3";
// playMP3("s.mp3");
// await Tone.start();
// loadAndPlayMIDIFile("i_giorni.mid");
// loadAndPlayMIDIFile("lk.mid");
// loadAndPlayMIDIFile("mirrors.mid");
// loadAndPlayMIDIFile("halo.mid");
// loadAndPlayMIDIFile("dps.mid");
// loadAndPlayMIDIFile("skyfall.mid");
// loadAndPlayMIDIFile("bond.mid");
// loadAndPlayMIDIFile("qqq.mid");
// loadAndPlayMIDIFile("qqq.mid");
// loadAndPlayMIDIFile("lkn.mid");
// loadAndPlayMIDIFile("t.mid");
// loadAndPlayMIDIFile("bella_ciao.mid");
// loadAndPlayMIDIFile("candy.mid");
// loadAndPlayMIDIFile("dr.mid");
// });
