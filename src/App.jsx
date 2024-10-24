import React from 'react';
import useMusicPlayer from './hooks/useMusicPlayer';
import './App.css';

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

const App = () => {
  const {
    state,
    dispatch,
    playSong,
    handlePausePlay,
    handleVolumeClick,
    handleProgressClick,
    handleFileUpload,
    handleNextSong,
    handlePreviousSong,
  } = useMusicPlayer();

  const { songTitles, currentSongIndex, progress, currentTime, totalTime, volume, isPlaying } = state;

  const getVolumeIcon = () => {
    if (volume === 0) {
      return "bi bi-volume-mute";
    } else if (volume > 0 && volume <= 0.5) {
      return "bi bi-volume-down";
    } else {
      return "bi bi-volume-up";
    }
  };

  return (
    <div className="player-container">
      <h1>MyMusic💚🎧</h1>
      <h2 className="current-song-title">{songTitles[currentSongIndex]}</h2>

      <div className="progress-bar" onClick={(e) => handleProgressClick(e.nativeEvent.offsetX / e.target.clientWidth * 100)}>
        <div className="progress-element">
          <div className="progress-level" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="time-display">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(totalTime)}</span>
        </div>
      </div>
      <div className="controls">
        <button onClick={handlePreviousSong}><i className="bi bi-rewind-fill"></i></button>
        <button onClick={handlePausePlay}>{isPlaying ? <i className="bi bi-pause-fill"></i> : <i className="bi bi-play-fill"></i>}</button>
        <button onClick={handleNextSong}><i className="bi bi-fast-forward-fill"></i></button>
      </div>
      <div className="settings-volume">
        <div className="volume-control" onClick={(e) => handleVolumeClick(e.nativeEvent.offsetX / e.target.clientWidth)}>
          <label><i className={getVolumeIcon()}></i></label>
          <div className="volume-bar">
            <div className="volume-level" style={{ width: `${volume * 100}%` }}></div>
          </div>
        </div>

        <div className="settings-buttons">
          <button onClick={() => dispatch({ type: 'TOGGLE_AUTOPLAY' })}>
            <i className="bi bi-arrow-left-right"></i>
          </button>
          <button onClick={() => dispatch({ type: 'TOGGLE_LOOP' })}>
            <i className="bi bi-arrow-counterclockwise"></i>
          </button>
          <button onClick={() => dispatch({ type: 'TOGGLE_SHUFFLE' })}>
            <i className="bi bi-shuffle"></i>
          </button>
        </div>
      </div>

      <div className="file-upload">
        <label htmlFor="song-upload" className="file-upload-label">Upload Songs</label>
        <input
          id="song-upload"
          type="file"
          multiple
          accept="audio/*"
          onChange={(e) => handleFileUpload(Array.from(e.target.files))}
          style={{ display: 'none' }}
        />
      </div>

      <ul>
        {songTitles.map((title, index) => (
          <li key={index}>
            <button
              onClick={() => playSong(index)}
              className={currentSongIndex === index ? 'active' : ''}
            >
              {`Reproducir: ${title}`}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
