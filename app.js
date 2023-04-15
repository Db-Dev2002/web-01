const notes = {
  "C": new Howl({ src: ["path/to/C-note.wav"] }),
  "C#": new Howl({ src: ["path/to/C-sharp-note.wav"] }),
  "D": new Howl({ src: ["path/to/D-note.wav"] }),
  "D#": new Howl({ src: ["path/to/D-sharp-note.wav"] }),
  "E": new Howl({ src: ["path/to/E-note.wav"] }),
  "F": new Howl({ src: ["path/to/F-note.wav"] }),
  "F#": new Howl({ src: ["path/to/F-sharp-note.wav"] }),
  "G": new Howl({ src: ["path/to/G-note.wav"] }),
  "G#": new Howl({ src: ["path/to/G-sharp-note.wav"] }),
  "A": new Howl({ src: ["path/to/A-note.wav"] }),
  "A#": new Howl({ src: ["path/to/A-sharp-note.wav"] }),
  "B": new Howl({ src: ["path/to/B-note.wav"] }),
};

document.querySelectorAll(".pianoBlackKey, .pianoWhiteKey").forEach((key) => {
  key.addEventListener("mousedown", (e) => {
    const note = e.target.dataset.note;
    notes[note].play();
  });
});

