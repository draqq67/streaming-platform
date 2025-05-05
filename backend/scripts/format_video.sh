#!/bin/bash

INPUT_DIR="./videos"
OUTPUT_DIR="./outputs"
TARGET_VIDEO_BITRATE="1000k"  # 1 Mbps
TARGET_AUDIO_BITRATE="64k"

mkdir -p "$OUTPUT_DIR"

for INPUT in "$INPUT_DIR"/*; do
  if [[ "$INPUT" =~ \.(mp4|mov|mkv|avi)$ ]]; then
    FILENAME=$(basename "$INPUT")
    BASENAME="${FILENAME%.*}"
    OUTPUT="$OUTPUT_DIR/${BASENAME}_480p_compressed.mp4"

    echo "🔄 Compressing to 480p: $FILENAME"

    # First pass
    ffmpeg -y -i "$INPUT" \
      -c:v libx264 -b:v $TARGET_VIDEO_BITRATE \
      -pass 1 -an -f mp4 /dev/null

    # Second pass
    ffmpeg -i "$INPUT" \
      -c:v libx264 -b:v $TARGET_VIDEO_BITRATE \
      -c:a aac -b:a $TARGET_AUDIO_BITRATE \
      -movflags +faststart \
      -vf "scale='min(854,iw)':'min(480,ih)':force_original_aspect_ratio=decrease" \
      -pass 2 \
      "$OUTPUT"

    echo "✅ Saved: $OUTPUT"
    echo "-----------------------------"
  else
    echo "⚠️ Skipping unsupported file: $INPUT"
  fi
done
