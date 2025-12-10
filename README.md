# おんぷメーカー (Onpu Maker) 🎵

A cute automatic music score creator that listens to your singing or playing and generates musical notation in real-time.

## Features

- **Real-time pitch detection** using the YIN algorithm
- **Automatic note duration estimation** (eighth, quarter, half notes)
- **Multi-line staff layout** (16 notes per line)
- **Cute, colorful UI** with Japanese text
- **Simple controls**: Start, Stop, Reset

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open your browser to `http://localhost:5173`

### Production Build

```bash
npm run build
```

## How to Use

1. Click **はじめる** (Start) to begin recording
2. Allow microphone access when prompted
3. Sing or play notes - they will appear on the staff
4. Hold notes for different lengths to see eighth, quarter, and half notes
5. Click **止める** (Stop) to pause recording
6. Click **リセット** (Reset) to clear the score
7. Use your browser's screenshot tool to save the score

## Current Limitations

- **Pitch accuracy**: Works best with clear, sustained notes in the range C3-C6
- **Rhythm approximation**: Duration is estimated based on hold time, not strict musical timing
- **Single voice**: Only one note at a time is detected
- **No editing**: Notes cannot be edited after they appear

## Technologies

- React + TypeScript + Vite
- VexFlow for music notation rendering
- Pitchfinder (YIN algorithm) for pitch detection
- Web Audio API for microphone input

## License

This project is a simple demonstration tool created for personal use.
