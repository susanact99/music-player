import React, { useReducer, useRef, useEffect } from 'react';
import { Howl } from 'howler';
import './App.css';

const initialState = {
  songs: [],
  songTitles: [],
  currentSongIndex: 0,
  currentSong: null,
  isPlaying: false,
  volume: 0.5,
  progress: 0,
  playNextAutomatically: false,
  isLooping: false,
  isShuffled: false,
  currentTime: 0,
  totalTime: 0
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_SONGS':
      return { ...state, songs: action.payload.songs, songTitles: action.payload.songTitles };
    case 'SET_CURRENT_SONG':
      return { ...state, currentSong: action.payload.song, currentSongIndex: action.payload.index };
    case 'TOGGLE_PLAY':
      return { ...state, isPlaying: !state.isPlaying };
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };
    case 'SET_VOLUME':
      return { ...state, volume: action.payload };
    case 'SET_PROGRESS':
      return { ...state, progress: action.payload };
    case 'TOGGLE_AUTOPLAY':
      return { ...state, playNextAutomatically: !state.playNextAutomatically };
    case 'TOGGLE_LOOP':
      return { ...state, isLooping: !state.isLooping };
    case 'TOGGLE_SHUFFLE':
      return { ...state, isShuffled: !state.isShuffled };
    case 'SET_CURRENT_TIME':
      return { ...state, currentTime: action.payload };
    case 'SET_TOTAL_TIME':
      return { ...state, totalTime: action.payload };
    default:
      return state;
  }
};

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { songs, songTitles, currentSongIndex, currentSong, isPlaying, volume, progress, playNextAutomatically, isLooping, isShuffled, currentTime, totalTime } = state;

  useEffect(() => {
    if (currentSong) {
      dispatch({ type: 'SET_TOTAL_TIME', payload: currentSong.duration() });

      const interval = setInterval(() => {
        const seek = currentSong.seek();
        const duration = currentSong.duration();
        dispatch({ type: 'SET_PROGRESS', payload: (seek / duration) * 100 });
        dispatch({ type: 'SET_CURRENT_TIME', payload: seek });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [currentSong]);

  const playSong = (index) => {
    if (currentSong) {
      currentSong.stop();
    }

    const newSong = new Howl({
      src: [songs[index]],
      html5: true,
      volume: volume,
      onend: () => {
        if (isLooping) {
          playSong(currentSongIndex);
        } else if (playNextAutomatically) {
          handleNextSong();
        }
      },
    });

    dispatch({ type: 'SET_CURRENT_SONG', payload: { song: newSong, index } });
    newSong.play();
    dispatch({ type: 'SET_PLAYING', payload: true });
  };

  const handlePausePlay = () => {
    if (isPlaying) {
      currentSong.pause();
    } else {
      currentSong.play();
    }
    dispatch({ type: 'TOGGLE_PLAY' });
  };

  const handleVolumeClick = (e) => {
    const volumeBarWidth = e.target.clientWidth;
    const offsetX = e.nativeEvent.offsetX;
    const newVolume = offsetX / volumeBarWidth;
    dispatch({ type: 'SET_VOLUME', payload: newVolume });
    if (currentSong) {
      currentSong.volume(newVolume);
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

  const handleProgressClick = (e) => {
    const progressBarWidth = e.target.clientWidth;
    const offsetX = e.nativeEvent.offsetX;
    const newProgress = (offsetX / progressBarWidth) * 100;
    dispatch({ type: 'SET_PROGRESS', payload: newProgress });
    if (currentSong) {
      const duration = currentSong.duration();
      currentSong.seek((newProgress / 100) * duration);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const songPaths = files.map(file => URL.createObjectURL(file));
    const titles = files.map(file => file.name);
    dispatch({ type: 'SET_SONGS', payload: { songs: songPaths, songTitles: titles } });
    if (files.length > 0) {
      playSong(0);
    }
  };

  const handleNextSong = () => {
    let nextIndex = currentSongIndex + 1;
    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * songs.length);
    } else if (isLooping) {
      nextIndex = currentSongIndex;
    } else {
      nextIndex = nextIndex % songs.length;
    }
    playSong(nextIndex);
  };

  const handlePreviousSong = () => {
    const prevIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    playSong(prevIndex);
  };

  return (
    <div className="player-container">
      <h1>MyMusic💚🎧</h1>
      <h2 className="current-song-title">{songTitles[currentSongIndex]}</h2>

      <div className="progress-bar" onClick={handleProgressClick}>
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

      <div className="file-upload">
      <label htmlFor="song-upload" className="file-upload-label">Upload Songs</label>
        <input
          id="song-upload"
          type="file"
          accept="audio/*"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          multiple
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
