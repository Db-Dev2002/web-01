import { Midi } from "@tonejs/midi";
import * as Tone from "tone";

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
        onload: () => console.log("Sampler loaded"),
        baseUrl: "",
    }).toDestination();

    return sampler;
};

let sampler;
const initSampler = async () => {
    if (!sampler) {
        sampler = await createSampler();
    }
};

const playNote = async (note) => {
    await initSampler();

    if (!note) {
        console.warn("Invalid note name:", note);
        return;
    }
    sampler.triggerAttackRelease(note, "8n");
};

document.querySelectorAll(".pianoBlackKey, .pianoWhiteKey").forEach((key) => {
    key.addEventListener("mousedown", async (e) => {
        const note = e.target.dataset.note;
        await playNote(note);
    });
});

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
                    duration: note.duration + 0.08,
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
