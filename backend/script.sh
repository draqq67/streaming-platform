#!/bin/bash

# Output file
OUTPUT_FILE="file_list.txt"

# Clear previous output
> "$OUTPUT_FILE"

# Recursively find target files, excluding node_modules
find . -path "./node_modules" -prune -o -type f \( -name "*.js" -o -name "*.py" -o -name "*.sh" \) -print | while read -r FILE; do
    echo "===== FILE: $FILE =====" >> "$OUTPUT_FILE"
    cat "$FILE" >> "$OUTPUT_FILE"
    echo -e "\n\n" >> "$OUTPUT_FILE"
done

echo "File contents saved to $OUTPUT_FILE"
