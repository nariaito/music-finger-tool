declare module 'pitchfinder' {
    export function YIN(options?: { sampleRate?: number; threshold?: number }): (signal: Float32Array) => number | null;
    export function AMDF(options?: { sampleRate?: number; minFrequency?: number; maxFrequency?: number }): (signal: Float32Array) => number | null;
    // Add other algorithms if needed
}
