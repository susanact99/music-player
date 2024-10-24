import { useReducer, useEffect } from 'react';
import { Howl } from 'howler';

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
  totalTime: 0,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_SONGS':
      return { ...state, songs: action.payload.songs, songTitles: action.payload.songTitles, currentSongIndex: 0, currentSong: null };
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

const useMusicPlayer = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { songs, currentSong, currentSongIndex, isPlaying, volume, isLooping, playNextAutomatically, isShuffled } = state;

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

  const handleVolumeClick = (newVolume) => {
    dispatch({ type: 'SET_VOLUME', payload: newVolume });
    if (currentSong) {
      currentSong.volume(newVolume);
    }
  };

  const handleProgressClick = (newProgress) => {
    dispatch({ type: 'SET_PROGRESS', payload: newProgress });
    if (currentSong) {
      const duration = currentSong.duration();
      currentSong.seek((newProgress / 100) * duration);
    }
  };

  const handleFileUpload = (files) => {
    const songPaths = files.map(file => URL.createObjectURL(file));
    const titles = files.map(file => file.name);
    dispatch({ type: 'SET_SONGS', payload: { songs: songPaths, songTitles: titles } });

    if (files.length > 0) {
      // Asegurarse de limpiar cualquier instancia previa de Howl
      if (currentSong) {
        currentSong.unload();
      }

      // Reproducir la primera canción de la nueva lista
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

  return {
    state,
    dispatch,
    playSong,
    handlePausePlay,
    handleVolumeClick,
    handleProgressClick,
    handleFileUpload,
    handleNextSong,
    handlePreviousSong,
  };
};

export default useMusicPlayer;
