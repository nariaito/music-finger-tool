import React, { useEffect, useRef } from 'react';
import { Renderer, Stave, StaveNote, Formatter, Voice } from 'vexflow';
import type { Note } from '../App';

interface ScoreDisplayProps {
    notes: Note[];
}

const MAX_NOTES_PER_LINE = 16;
const LINE_HEIGHT = 120;
const STAVE_WIDTH = 750; // Fixed width for each line

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ notes }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Clear previous rendering safely
        container.innerHTML = '';

        if (!notes || notes.length === 0) {
            // Render an empty stave if no notes
            const renderer = new Renderer(container, Renderer.Backends.SVG);
            renderer.resize(800, 200);
            const context = renderer.getContext();
            const stave = new Stave(10, 40, STAVE_WIDTH);
            stave.addClef('treble').addTimeSignature('4/4');
            stave.setContext(context).draw();
            return;
        }

        // Calculate total height needed
        const numLines = Math.ceil(notes.length / MAX_NOTES_PER_LINE);
        const height = Math.max(200, numLines * LINE_HEIGHT + 50);

        // Create VexFlow renderer
        const renderer = new Renderer(container, Renderer.Backends.SVG);
        renderer.resize(800, height);
        const context = renderer.getContext();

        // Chunk notes and render each line
        for (let i = 0; i < numLines; i++) {
            const start = i * MAX_NOTES_PER_LINE;
            const end = start + MAX_NOTES_PER_LINE;
            const chunk = notes.slice(start, end);

            const y = 20 + i * LINE_HEIGHT;
            const stave = new Stave(10, y, STAVE_WIDTH);
            stave.addClef('treble');

            if (i === 0) {
                stave.addTimeSignature('4/4');
            }

            stave.setContext(context).draw();

            try {
                const staveNotes = chunk.map((n) => {
                    return new StaveNote({
                        keys: [n.key], // Already in lowercase VexFlow format
                        duration: n.duration,
                    });
                });

                if (staveNotes.length > 0) {
                    // Calculate total beats for this voice based on note durations
                    const totalBeats = staveNotes.reduce((acc, note) => {
                        const originalNote = chunk[staveNotes.indexOf(note)];
                        const d = originalNote.duration;

                        switch (d) {
                            case '8': return acc + 0.5;
                            case 'q': return acc + 1;
                            case 'h': return acc + 2;
                            default: return acc + 1;
                        }
                    }, 0);

                    const voice = new Voice({ numBeats: totalBeats, beatValue: 4 });
                    voice.setStrict(false);
                    voice.addTickables(staveNotes);

                    new Formatter().joinVoices([voice]).format([voice], STAVE_WIDTH - 50);

                    voice.draw(context, stave);
                }
            } catch (e) {
                // VexFlow rendering error - skip this line
            }
        }

    }, [notes]);

    return (
        <div
            id="score-container"
            ref={containerRef}
            style={{
                minHeight: '200px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                backgroundColor: '#fff',
                borderRadius: '15px',
                boxShadow: 'inset 0 0 20px #f0f0f0',
                overflow: 'auto',
                padding: '20px'
            }}
        />
    );
};

export default ScoreDisplay;
