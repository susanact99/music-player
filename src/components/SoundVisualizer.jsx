import React, { useEffect, useRef } from 'react';
import './soundVisualizer.css';

const SoundVisualizer = ({ getAudioData }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const renderFrame = () => {
      const data = getAudioData();
      if (data) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#4caf50';
        const barWidth = (canvas.width / data.length) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < data.length; i++) {
          barHeight = data[i];
          ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
          x += barWidth + 1;
        }
      }
      requestAnimationFrame(renderFrame);
    };

    renderFrame();
  }, [getAudioData]);

  return <canvas ref={canvasRef}    />;
};

export default SoundVisualizer;
