import { useReducer, useEffect, useRef } from 'react';
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
    case 'REMOVE_SONG': // Nueva acción para eliminar una canción
      const newSongs = state.songs.filter((_, index) => index !== action.payload);
      const newSongTitles = state.songTitles.filter((_, index) => index !== action.payload);
      
      // Ajustar el índice de la canción actual y detener la reproducción si es necesario
      let newIndex = state.currentSongIndex;
      let newCurrentSong = state.currentSong;

      if (action.payload === state.currentSongIndex) {
        newCurrentSong = null;
        newIndex = newSongs.length > 0 ? 0 : -1;
      } else if (action.payload < state.currentSongIndex) {
        newIndex = state.currentSongIndex - 1;
      }

      return {
        ...state,
        songs: newSongs,
        songTitles: newSongTitles,
        currentSongIndex: newIndex,
        currentSong: newCurrentSong,
        isPlaying: false,
      };
    default:
      return state;
  }
};

const useMusicPlayer = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { songs, currentSong, currentSongIndex, isPlaying, volume, isLooping, playNextAutomatically, isShuffled } = state;
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);

  useEffect(() => {
    if (currentSong) {
      dispatch({ type: 'SET_TOTAL_TIME', payload: currentSong.duration() });

      setupAudioAnalyser();

      const interval = setInterval(() => {
        const seek = currentSong.seek();
        const duration = currentSong.duration();
        dispatch({ type: 'SET_PROGRESS', payload: (seek / duration) * 100 });
        dispatch({ type: 'SET_CURRENT_TIME', payload: seek });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [currentSong]);

  const setupAudioAnalyser = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
    }

    const source = audioContextRef.current.createMediaElementSource(currentSong._sounds[0]._node);
    source.connect(analyserRef.current);
    analyserRef.current.connect(audioContextRef.current.destination);
    sourceRef.current = source;
  };

  const getAudioData = () => {
    if (analyserRef.current && dataArrayRef.current) {
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      return dataArrayRef.current;
    }
    return null;
  };

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

  const handleRemoveSong = (index) => { // Nueva función para eliminar canciones
    if (state.currentSongIndex === index && state.currentSong) {
      state.currentSong.stop(); // Detener la canción actual si se elimina
    }
    dispatch({ type: 'REMOVE_SONG', payload: index });
  };

  return {
    state,
    dispatch,
    playSong,
    handlePausePlay,
    handleFileUpload,
    handleNextSong,
    handlePreviousSong,
    handleRemoveSong, // Nueva función añadida aquí
    getAudioData,
  };
};

export default useMusicPlayer;
