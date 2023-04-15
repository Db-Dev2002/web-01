const notes = {
    C0: new Howl({ src: ["notes/1.wav"] }),
    "C0#": new Howl({ src: ["notes/2.wav"] }),
    D0: new Howl({ src: ["notes/3.wav"] }),
    "D0#": new Howl({ src: ["notes/4.wav"] }),
    E0: new Howl({ src: ["notes/5.wav"] }),
    F0: new Howl({ src: ["notes/6.wav"] }),
    "F0#": new Howl({ src: ["notes/7.wav"] }),
    G0: new Howl({ src: ["notes/8.wav"] }),
    "G0#": new Howl({ src: ["notes/9.wav"] }),
    A0: new Howl({ src: ["notes/10.wav"] }),
    "A0#": new Howl({ src: ["notes/11.wav"] }),
    B0: new Howl({ src: ["notes/12.wav"] }),
    C1: new Howl({ src: ["notes/13.wav"] }),
    "C1#": new Howl({ src: ["notes/14.wav"] }),
    D1: new Howl({ src: ["notes/15.wav"] }),
    "D1#": new Howl({ src: ["notes/16.wav"] }),
    E1: new Howl({ src: ["notes/17.wav"] }),
    F1: new Howl({ src: ["notes/18.wav"] }),
    "F1#": new Howl({ src: ["notes/19.wav"] }),
    G1: new Howl({ src: ["notes/20.wav"] }),
    "G1#": new Howl({ src: ["notes/21.wav"] }),
    A1: new Howl({ src: ["notes/22.wav"] }),
    "A1#": new Howl({ src: ["notes/23.wav"] }),
    B1: new Howl({ src: ["notes/24.wav"] }),
    C2: new Howl({ src: ["notes/25.wav"] }),
    "C2#": new Howl({ src: ["notes/26.wav"] }),
    D2: new Howl({ src: ["notes/27.wav"] }),
    "D2#": new Howl({ src: ["notes/28.wav"] }),
    E2: new Howl({ src: ["notes/29.wav"] }),
    F2: new Howl({ src: ["notes/30.wav"] }),
    "F2#": new Howl({ src: ["notes/31.wav"] }),
    G2: new Howl({ src: ["notes/32.wav"] }),
    "G2#": new Howl({ src: ["notes/33.wav"] }),
    A2: new Howl({ src: ["notes/34.wav"] }),
    "A2#": new Howl({ src: ["notes/35.wav"] }),
    B2: new Howl({ src: ["notes/36.wav"] }),
};

document.querySelectorAll(".pianoBlackKey, .pianoWhiteKey").forEach((key) => {
    key.addEventListener("mousedown", (e) => {
        const note = e.target.dataset.note;
        notes[note].play();
    });
});
