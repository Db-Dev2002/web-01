#!/bin/bash

threshold="-55dB"

for input_file in notes/*.wav; do
  output_file="${input_file%.*}_trimmed.wav"
  ffmpeg -i "$input_file" -af "silenceremove=start_periods=1:start_threshold=$threshold" "$output_file"
done

