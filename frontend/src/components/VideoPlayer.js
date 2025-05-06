import React, { useRef, useState, useEffect } from 'react';

const VideoPlayer = ({ videoUrl, posterUrl }) => {
  const videoRef = useRef(null);
  const controlsTimeout = useRef(null);
  const [isPaused, setIsPaused] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [subtitleTrack, setSubtitleTrack] = useState(null);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  const convertSrtToVtt = async (srtFile) => {
    const srtText = await srtFile.text();
    const vttText =
      'WEBVTT\n\n' +
      srtText
        .replace(/\r+/g, '')
        .replace(/^\d+\s*$/gm, '')
        .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');
    const vttBlob = new Blob([vttText], { type: 'text/vtt' });
    return URL.createObjectURL(vttBlob);
  };

  const handleSubtitleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    let subtitleURL = null;

    if (ext === 'vtt') {
      subtitleURL = URL.createObjectURL(file);
    } else if (ext === 'srt') {
      subtitleURL = await convertSrtToVtt(file);
    }

    setSubtitleTrack(subtitleURL);
  };

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const handlePlaybackRateChange = (e) => {
    const rate = parseFloat(e.target.value);
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen().catch(() => {});
    }
  };

  const togglePiP = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.error('PiP error:', err);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => setShowControls(false), 3000);
  };

  const handleKeyDown = (e) => {
    const video = videoRef.current;
    switch (e.key) {
      case ' ':
        e.preventDefault();
        togglePlayPause();
        break;
      case 'ArrowRight':
        video.currentTime += 5;
        break;
      case 'ArrowLeft':
        video.currentTime -= 5;
        break;
      case 'f':
      case 'F':
        toggleFullscreen();
        break;
      case 'm':
      case 'M':
        video.muted = !video.muted;
        break;
      default:
        break;
    }
  };
  useEffect(() => {
    const video = videoRef.current;

    const updatePauseState = () => setIsPaused(video.paused);
    video.addEventListener('play', updatePauseState);
    video.addEventListener('pause', updatePauseState);
    video.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keydown', handleKeyDown);

    handleMouseMove(); // show controls initially

    return () => {
      video.removeEventListener('play', updatePauseState);
      video.removeEventListener('pause', updatePauseState);
      video.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div
      className="video-player"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '900px',
        margin: '0 auto',
      }}
      onMouseMove={handleMouseMove}
    >
      <video
        ref={videoRef}
        controls={false}
        poster={`https://image.tmdb.org/t/p/w500${posterUrl}`}
        style={{ width: '100%', height: 'auto', borderRadius: '10px' }}
        onClick={togglePlayPause}
      >
        <source src={videoUrl} type="video/mp4" />
        {subtitleTrack && (
          <track
            label="Custom Subtitles"
            kind="subtitles"
            srcLang="en"
            src={subtitleTrack}
            default
          />
        )}
      </video>

      {showControls && (
        <div
          className="controls"
          style={{
            position: 'absolute',
            bottom: 0,
            width: '90%',
            alignContent: 'center',
            background: 'rgba(0,0,0,0.5)',
            color: 'white',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px',
            gap: '10px',
          }}
        >
          <button onClick={togglePlayPause}>{isPaused ? '▶️' : '⏸️'}</button>
          <label>
            Speed:
            <select
              value={playbackRate}
              onChange={handlePlaybackRateChange}
              style={{ marginLeft: '5px' }}
            >
              <option value="0.5">0.5x</option>
              <option value="1">1x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>
            </select>
          </label>
          <button onClick={togglePiP}>🧊 PiP</button>
          <button onClick={toggleFullscreen}>⛶ Fullscreen</button>
          <button>
            <a
              href={videoUrl}
              download
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              ⬇️ Download
            </a>
          </button>
          <input
            type="file"
            accept=".vtt,.srt"
            onChange={handleSubtitleUpload}
            style={{ color: 'white' }}
          />
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
