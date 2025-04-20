import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  IconButton, 
  Slider, 
  Typography, 
  Menu, 
  MenuItem, 
  FormControl, 
  Select, 
  Grid, 
  Paper,
  Tooltip
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import SettingsIcon from '@mui/icons-material/Settings';
import SubtitlesIcon from '@mui/icons-material/Subtitles';
import SpeedIcon from '@mui/icons-material/Speed';

const VideoPlayer = ({ 
  videoUrl, 
  title, 
  subtitles = [],
  qualityOptions = [
    { label: "1080p", value: "1080p", url: "" },
    { label: "720p", value: "720p", url: "" },
    { label: "480p", value: "480p", url: "" },
    { label: "360p", value: "360p", url: "" }
  ]
}) => {
  // States
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedQuality, setSelectedQuality] = useState(qualityOptions[0].value);
  const [selectedSubtitle, setSelectedSubtitle] = useState('off');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [controlTimeout, setControlTimeout] = useState(null);
  
  // Refs
  const videoRef = useRef(null);
  const trackRef = useRef(null);
  
  // Menus states
  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
  const [subtitlesAnchorEl, setSubtitlesAnchorEl] = useState(null);
  const [speedAnchorEl, setSpeedAnchorEl] = useState(null);
  const [qualityAnchorEl, setQualityAnchorEl] = useState(null);

  const openSettingsMenu = (event) => setSettingsAnchorEl(event.currentTarget);
  const closeSettingsMenu = () => setSettingsAnchorEl(null);
  
  const openSubtitlesMenu = (event) => {
    setSubtitlesAnchorEl(event.currentTarget);
    closeSettingsMenu();
  };
  const closeSubtitlesMenu = () => setSubtitlesAnchorEl(null);
  
  const openSpeedMenu = (event) => {
    setSpeedAnchorEl(event.currentTarget);
    closeSettingsMenu();
  };
  const closeSpeedMenu = () => setSpeedAnchorEl(null);
  
  const openQualityMenu = (event) => {
    setQualityAnchorEl(event.currentTarget);
    closeSettingsMenu();
  };
  const closeQualityMenu = () => setQualityAnchorEl(null);

  // Control visibility timer
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      
      // Clear existing timeout
      if (controlTimeout) {
        clearTimeout(controlTimeout);
      }
      
      // Set new timeout to hide controls after 3 seconds
      const timeout = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
      
      setControlTimeout(timeout);
    };
    
    const container = document.getElementById('video-container');
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseenter', handleMouseMove);
      container.addEventListener('mouseleave', () => {
        if (isPlaying) {
          setShowControls(false);
        }
      });
    }
    
    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseenter', handleMouseMove);
        container.removeEventListener('mouseleave', () => {});
      }
      if (controlTimeout) {
        clearTimeout(controlTimeout);
      }
    };
  }, [isPlaying, controlTimeout]);

  // Handle time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Handle metadata loaded
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  // Handle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle volume change
  const handleVolumeChange = (e, newValue) => {
    setVolume(newValue);
    if (videoRef.current) {
      videoRef.current.volume = newValue;
    }
    setIsMuted(newValue === 0);
  };

  // Handle mute toggle
  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  // Handle seek
  const handleSeek = (e, newValue) => {
    if (videoRef.current) {
      videoRef.current.currentTime = newValue;
      setCurrentTime(newValue);
    }
  };

  // Handle fullscreen
  const toggleFullscreen = () => {
    const container = document.getElementById('video-container');
    if (container) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        container.requestFullscreen();
      }
    }
  };

  // Handle quality change
  const handleQualityChange = (quality) => {
    const currentTime = videoRef.current.currentTime;
    const wasPlaying = isPlaying;
    
    setSelectedQuality(quality);
    closeQualityMenu();
    
    // In a real implementation, you would switch video sources here
    // For demo purposes, we're just pretending to change quality
    
    // Restore playback state and position
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = currentTime;
        if (wasPlaying) {
          videoRef.current.play();
        }
      }
    }, 100);
  };

  // Handle subtitle selection
  const handleSubtitleChange = (subtitle) => {
    setSelectedSubtitle(subtitle);
    closeSubtitlesMenu();
    
    if (subtitle === 'off') {
      if (trackRef.current) {
        trackRef.current.mode = 'disabled';
      }
    } else {
      if (trackRef.current) {
        trackRef.current.mode = 'showing';
      }
    }
  };

  // Handle playback speed change
  const handleSpeedChange = (speed) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      closeSpeedMenu();
    }
  };

  // Format time (seconds to MM:SS)
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <Box id="video-container" sx={{ position: 'relative', width: '100%', bgcolor: 'black' }}>
      <video
        ref={videoRef}
        src={videoUrl}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        {subtitles.map((subtitle, index) => (
          <track
            key={index}
            ref={index === 0 ? trackRef : null}
            kind="subtitles"
            src={subtitle.src}
            srcLang={subtitle.lang}
            label={subtitle.label}
            default={index === 0 && selectedSubtitle !== 'off'}
          />
        ))}
      </video>

      {/* Video Controls */}
      {showControls && (
        <Paper 
          elevation={0}
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            p: 1,
            background: 'rgba(0, 0, 0, 0.7)',
            transition: 'opacity 0.3s',
            color: 'white'
          }}
        >
          {/* Progress bar */}
          <Slider
            value={currentTime}
            min={0}
            max={duration || 100}
            onChange={handleSeek}
            sx={{ 
              color: 'primary.main',
              height: 4,
              '& .MuiSlider-thumb': {
                width: 12,
                height: 12,
                display: 'none',
                '&:hover, &.Mui-focusVisible': {
                  display: 'block'
                }
              },
              '&:hover .MuiSlider-thumb': {
                display: 'block'
              }
            }}
          />

          <Grid container alignItems="center" spacing={1}>
            <Grid item>
              <IconButton onClick={togglePlay} sx={{ color: 'white' }}>
                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
            </Grid>
            
            <Grid item xs={2} sm={1} sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={toggleMute} sx={{ color: 'white' }}>
                {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
              </IconButton>
              <Box sx={{ width: '50px', ml: 1, display: { xs: 'none', sm: 'block' } }}>
                <Slider
                  value={isMuted ? 0 : volume}
                  min={0}
                  max={1}
                  step={0.1}
                  onChange={handleVolumeChange}
                  sx={{ color: 'white' }}
                />
              </Box>
            </Grid>
            
            <Grid item xs>
              <Typography variant="body2" sx={{ display: 'inline-block', ml: 1 }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </Typography>
            </Grid>
            
            <Grid item>
              <IconButton onClick={openSubtitlesMenu} sx={{ color: 'white' }}>
                <SubtitlesIcon />
              </IconButton>
              <Menu
                anchorEl={subtitlesAnchorEl}
                open={Boolean(subtitlesAnchorEl)}
                onClose={closeSubtitlesMenu}
              >
                <MenuItem 
                  onClick={() => handleSubtitleChange('off')}
                  selected={selectedSubtitle === 'off'}
                >
                  Off
                </MenuItem>
                {subtitles.map((subtitle, index) => (
                  <MenuItem 
                    key={index}
                    onClick={() => handleSubtitleChange(subtitle.lang)}
                    selected={selectedSubtitle === subtitle.lang}
                  >
                    {subtitle.label}
                  </MenuItem>
                ))}
              </Menu>
            </Grid>
            
            <Grid item>
              <IconButton onClick={openSettingsMenu} sx={{ color: 'white' }}>
                <SettingsIcon />
              </IconButton>
              <Menu
                anchorEl={settingsAnchorEl}
                open={Boolean(settingsAnchorEl)}
                onClose={closeSettingsMenu}
              >
                <MenuItem onClick={openQualityMenu}>
                  <Typography>Quality ({selectedQuality})</Typography>
                </MenuItem>
                <MenuItem onClick={openSpeedMenu}>
                  <Typography>Playback Speed ({playbackSpeed}x)</Typography>
                </MenuItem>
              </Menu>
              
              {/* Quality Menu */}
              <Menu
                anchorEl={qualityAnchorEl}
                open={Boolean(qualityAnchorEl)}
                onClose={closeQualityMenu}
              >
                {qualityOptions.map((option, index) => (
                  <MenuItem 
                    key={index}
                    onClick={() => handleQualityChange(option.value)}
                    selected={selectedQuality === option.value}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </Menu>
              
              {/* Speed Menu */}
              <Menu
                anchorEl={speedAnchorEl}
                open={Boolean(speedAnchorEl)}
                onClose={closeSpeedMenu}
              >
                {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => (
                  <MenuItem 
                    key={speed}
                    onClick={() => handleSpeedChange(speed)}
                    selected={playbackSpeed === speed}
                  >
                    {speed}x
                  </MenuItem>
                ))}
              </Menu>
            </Grid>
            
            <Grid item>
              <Tooltip title="Fullscreen">
                <IconButton onClick={toggleFullscreen} sx={{ color: 'white' }}>
                  <FullscreenIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default VideoPlayer;