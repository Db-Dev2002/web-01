import { Midi } from "@tonejs/midi";
import * as Tone from "tone";

function createAnalyzer() {
    const audioContext = Tone.context.rawContext;
    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 2048;
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

const createSampler = async () => {
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

    const { analyzer, dataArray } = createAnalyzer();
    sampler.connect(analyzer);
    sampler.toDestination();

    return { sampler, analyzer, dataArray };
};

let sampler, analyzer, dataArray;
const initSampler = async () => {
    const loadingIndicator = document.getElementById("loading");

    if (!sampler) {
        const result = await createSampler();
        sampler = result.sampler;
        analyzer = result.analyzer;
        dataArray = result.dataArray;
    }
    loadingIndicator.style.display = "none";

    drawEqualizer();
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
    const bufferLength = analyzer.frequencyBinCount;

    function draw() {
        analyzer.getByteFrequencyData(dataArray);

        canvasCtx.fillStyle = "rgba(30, 38, 48, 0.2)";
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i];

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
};

const playMidiButton = document.getElementById("play-midi");

playMidiButton.addEventListener("click", async () => {
    await Tone.start();
    loadAndPlayMIDIFile("lk.mid");
    // loadAndPlayMIDIFile("lkn.mid");
    // loadAndPlayMIDIFile("t.mid");
    // loadAndPlayMIDIFile("bella_ciao.mid");
    // loadAndPlayMIDIFile("dr.mid");
});
