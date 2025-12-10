import React, { useEffect, useRef } from 'react';
import { YIN } from 'pitchfinder';
import type { Note } from '../App';

interface AudioAnalyzerProps {
    onNoteDetected: (note: Note) => void;
}

const AudioAnalyzer: React.FC<AudioAnalyzerProps> = ({ onNoteDetected }) => {
    const audioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const analyzerRef = useRef<AnalyserNode | null>(null);
    const requestRef = useRef<number | null>(null);

    const currentNoteRef = useRef<string | null>(null);
    const noteStartTimeRef = useRef<number | null>(null);

    // Stability tracking
    const lastDetectedPitchRef = useRef<string | null>(null);
    const stabilityCounterRef = useRef<number>(0);

    useEffect(() => {
        const startAudio = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                streamRef.current = stream;

                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                audioContextRef.current = audioContext;

                const source = audioContext.createMediaStreamSource(stream);
                const analyzer = audioContext.createAnalyser();
                analyzer.fftSize = 2048;
                source.connect(analyzer);
                analyzerRef.current = analyzer;

                const detectPitch = YIN({ sampleRate: audioContext.sampleRate });
                const buffer = new Float32Array(analyzer.fftSize);

                const update = () => {
                    analyzer.getFloatTimeDomainData(buffer);
                    const pitch = detectPitch(buffer);
                    const now = audioContext.currentTime;

                    let detectedNote: string | null = null;
                    if (pitch) {
                        detectedNote = getNoteFromPitch(pitch);
                    }

                    // Stability check
                    if (detectedNote === lastDetectedPitchRef.current) {
                        stabilityCounterRef.current++;
                    } else {
                        lastDetectedPitchRef.current = detectedNote;
                        stabilityCounterRef.current = 0;
                    }

                    // Consider note "stable" if held for ~5 frames
                    const isStable = stabilityCounterRef.current >= 5;
                    const stableNote = isStable ? detectedNote : null;

                    // Logic to track duration
                    // If the stable note is different from what we are currently "holding" (currentNoteRef),
                    // then the previous note has ended.
                    if (stableNote !== currentNoteRef.current) {
                        // If we were holding a note, finish it
                        if (currentNoteRef.current && noteStartTimeRef.current !== null) {
                            const durationSeconds = now - noteStartTimeRef.current;

                            // Filter out very short blips if needed, but 5 frames stability might be enough
                            if (durationSeconds > 0.1) {
                                const rhythmicDuration = getRhythmicDuration(durationSeconds);
                                onNoteDetected({
                                    key: currentNoteRef.current,
                                    duration: rhythmicDuration
                                });
                            }
                        }

                        // Start new note
                        if (stableNote) {
                            currentNoteRef.current = stableNote;
                            noteStartTimeRef.current = now;
                        } else {
                            currentNoteRef.current = null;
                            noteStartTimeRef.current = null;
                        }
                    }

                    requestRef.current = requestAnimationFrame(update);
                };

                update();

            } catch (err) {
                // Microphone access denied or error
            }
        };

        startAudio();

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, [onNoteDetected]);

    const getNoteFromPitch = (frequency: number): string | null => {
        // Use lowercase note names for VexFlow compatibility
        const noteStrings = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"];
        const A4 = 440;
        const semitones = 12 * Math.log2(frequency / A4);
        const noteIndex = Math.round(semitones) + 69; // MIDI note number

        if (noteIndex < 0 || noteIndex > 127) return null;

        const octave = Math.floor(noteIndex / 12) - 1;
        const noteName = noteStrings[noteIndex % 12];

        // Simple range filter (e.g., C3 to C6) to avoid noise
        if (octave < 3 || octave > 6) return null;

        // Return in VexFlow format: lowercase note/octave (e.g., "c/4", "f#/5")
        return `${noteName}/${octave}`;
    };

    const getRhythmicDuration = (seconds: number): string => {
        if (seconds < 0.35) return "8";
        if (seconds < 0.8) return "q";
        return "h";
    };

    return (
        <div style={{ marginTop: '1rem', color: 'var(--secondary-color)' }}>
            <p>🎤 おとをきいているよ... (うたってね！)</p>
        </div>
    );
};

export default AudioAnalyzer;
