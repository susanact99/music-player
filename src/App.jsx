import React from 'react';
import useMusicPlayer from './hooks/useMusicPlayer';
import SoundVisualizer from './components/SoundVisualizer';
import './App.css';

const App = () => {
  const {
    state,
    dispatch,
    playSong,
    handlePausePlay,
    handleFileUpload,
    handleNextSong,
    handlePreviousSong,
    handleRemoveSong, // Asegúrate de incluir la nueva función aquí
    getAudioData,
  } = useMusicPlayer();

  const {
    songTitles,
    currentSongIndex,
    progress,
    isPlaying,
    currentTime,
    totalTime,
    volume,
  } = state;

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleProgressClick = (e) => {
    const progressBarWidth = e.target.clientWidth;
    const offsetX = e.nativeEvent.offsetX;
    const newProgress = (offsetX / progressBarWidth) * 100;
    dispatch({ type: 'SET_PROGRESS', payload: newProgress });
    if (state.currentSong) {
      const duration = state.currentSong.duration();
      state.currentSong.seek((newProgress / 100) * duration);
    }
  };

  const handleVolumeClick = (e) => {
    const volumeBarWidth = e.target.clientWidth;
    const offsetX = e.nativeEvent.offsetX;
    const newVolume = offsetX / volumeBarWidth;
    dispatch({ type: 'SET_VOLUME', payload: newVolume });
    if (state.currentSong) {
      state.currentSong.volume(newVolume);
    }
  };

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
      <h2 className='roboto-regular'>MyMusic <img src="./src/assets/LOGO.webp" alt="music logo" /></h2>

      {/* Título de la canción */}
      <h2 className="current-song-title">{songTitles[currentSongIndex]}</h2>

      <div className='visualizer'>
        <SoundVisualizer getAudioData={getAudioData} />
      </div>

      {/* Barra de progreso */}
      <div className="progress-bar" onClick={handleProgressClick}>
        <div className="progress-element">
          <div className="progress-level" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="time-display">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(totalTime)}</span>
        </div>
      </div>

      {/* Controles de reproducción */}
      <div className="controls">
        <button onClick={handlePreviousSong}><i className="bi bi-rewind-fill"></i></button>
        <button onClick={handlePausePlay}>
          {isPlaying ? <i className="bi bi-pause-fill"></i> : <i className="bi bi-play-fill"></i>}
        </button>
        <button onClick={handleNextSong}><i className="bi bi-fast-forward-fill"></i></button>
      </div>

      {/* Control de volumen */}
      <div className="settings-volume">
        <div className="volume-control" onClick={handleVolumeClick}>
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

      {/* Subida de archivos */}
      <div className="file-upload">
        <label htmlFor="song-upload" className="file-upload-label">Upload Songs <i className="bi bi-folder2-open"></i></label>
        <input
          id="song-upload"
          type="file"
          multiple
          accept="audio/*"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
      </div>

      {/* Lista de canciones */}
      <ul>
        {songTitles.map((title, index) => (
          <li key={index}>
            <div
              className={currentSongIndex === index ? 'active' : ''}
            >
              <button onClick={() => playSong(index)}>
                {`Reproducir: ${title}`}
              </button>

              <button className='delete-song' onClick={() => handleRemoveSong(index)}>
                <i className="bi bi-trash3"></i>
              </button>
            </div>

          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
