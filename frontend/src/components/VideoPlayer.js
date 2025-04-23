import React, { useEffect, useRef, useState } from 'react';

const VideoPlayer = ({ videoUrl }) => {
  const videoRef = useRef(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [error, setError] = useState(null);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [subtitleTrack, setSubtitleTrack] = useState(null);

  useEffect(() => {
    if (videoRef.current && isVideoReady) {
      videoRef.current.play().catch((err) => {
        console.error('Autoplay error:', err);
        setError('Autoplay blocked or failed');
      });
    }
  }, [isVideoReady]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const handleLoadedMetadata = () => {
    setIsVideoReady(true);
  };

  const handleError = () => {
    setError('Failed to load video. Please try again later.');
    console.error('Video load error');
  };

  const handleSubtitleUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileURL = URL.createObjectURL(file);
    setSubtitleTrack(fileURL);
  };

  const handlePlaybackRateChange = (e) => {
    setPlaybackRate(parseFloat(e.target.value));
  };

  return (
    <div className="video-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {error && <div className="error-message">{error}</div>}

      <video
        ref={videoRef}
        controls
        preload="auto"
        onLoadedMetadata={handleLoadedMetadata}
        onError={handleError}
        style={{ width: '100%', maxHeight: '80vh' }}
      >
        <source src={videoUrl} type="video/mp4" />
        {subtitleTrack && (
          <track
            label="User Subtitle"
            kind="subtitles"
            srcLang="en"
            src={subtitleTrack}
            default
          />
        )}
        Your browser does not support the video tag.
      </video>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <label htmlFor="subtitle-upload">
          Upload Subtitles (.vtt or .srt):
          <input
            type="file"
            id="subtitle-upload"
            accept=".vtt,.srt"
            onChange={handleSubtitleUpload}
            style={{ marginLeft: '0.5rem' }}
          />
        </label>

      </div>
    </div>
  );
};

export default VideoPlayer;
