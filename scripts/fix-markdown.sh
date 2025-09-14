#!/bin/bash

# Fix markdown formatting issues
for file in "CSS_MIGRATION_TOOL.md" "docs/AI_SYSTEMS_CHECK.md"; do
    if [ -f "$file" ]; then
        echo "Fixing markdown formatting in $file..."
        
        # Add blank lines around headings and lists
        sed -i 's/^#/\n#/g' "$file"
        sed -i 's/^- /\n- /g' "$file"
        sed -i 's/^```/\n```/g' "$file"
        sed -i 's/^```$/```\n/g' "$file"
        
        # Clean up multiple newlines
        sed -i '/^$/N;/^\n$/d' "$file"
        
        echo "Fixed $file"
    fi
done
