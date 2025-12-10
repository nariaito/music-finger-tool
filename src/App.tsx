import { useState } from 'react'
import AudioAnalyzer from './components/AudioAnalyzer'
import ScoreDisplay from './components/ScoreDisplay'
import './App.css'

export interface Note {
  key: string;
  duration: string;
}

function App() {
  const [isRecording, setIsRecording] = useState(false)
  const [notes, setNotes] = useState<Note[]>([])

  const handleNoteDetected = (note: Note) => {
    setNotes((prev) => [...prev, note])
  }

  return (
    <div className="app-container">
      <h1>おんぷメーカー 🎵</h1>
      <p className="instructions">
        マイクを許可して、音を出すと楽譜に音符が追加されます。
      </p>
      <div className="controls">
        <button onClick={() => setIsRecording(!isRecording)}>
          {isRecording ? '止める 🛑' : 'はじめる ▶️'}
        </button>
        <button onClick={() => setNotes([])} style={{ backgroundColor: 'var(--accent-color)' }}>
          リセット 🔄
        </button>
      </div>
      <div className="main-content">
        <ScoreDisplay notes={notes} />
        {isRecording && <AudioAnalyzer onNoteDetected={handleNoteDetected} />}
      </div>
    </div>
  )
}

export default App
