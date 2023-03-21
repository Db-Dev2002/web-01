const notes = {
    C: new Howl({ src: ["path/to/C-note.wav"] }),
    D: new Howl({ src: ["path/to/D-note.wav"] }),
    E: new Howl({ src: ["path/to/E-note.wav"] }),
    F: new Howl({ src: ["path/to/F-note.wav"] }),
    G: new Howl({ src: ["path/to/G-note.wav"] }),
    A: new Howl({ src: ["path/to/A-note.wav"] }),
    B: new Howl({ src: ["path/to/B-note.wav"] }),
};

document.querySelectorAll(".piano-key").forEach((key) => {
    key.addEventListener("mousedown", (e) => {
        const note = e.target.dataset.note;

        notes[note].play();
    });
});

document.querySelectorAll(".play-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        const track = btn.parentElement;
        const pianoKeys = track.querySelectorAll(".piano-key");
        const sequence = ["C", "D", "E", "F", "G", "A", "B"]; // Replace with your desired sequence of notes

        let index = 0;
        const playSequence = () => {
            if (index >= sequence.length) {
                index = 0;
                return;
            }

            const note = sequence[index];
            notes[note].play();

            // Visually indicate the currently playing note
            const currentKey = Array.from(pianoKeys).find(
                (key) => key.dataset.note === note
            );
            currentKey.classList.add("active");
            setTimeout(() => currentKey.classList.remove("active"), 200);

            index++;
            setTimeout(playSequence, 400);
        };
        playSequence();
    });
});
