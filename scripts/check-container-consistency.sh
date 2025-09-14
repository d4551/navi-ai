#!/bin/bash

echo "🔍 NAVI Container Consistency Check"
echo "=================================="

echo ""
echo "📊 Checking for hardcoded max-widths in views..."
hardcoded_widths=$(grep -r "max-width: [0-9]" src/views/ --include="*.vue" | grep -v "@media" | grep -v "Component-specific" | grep -v "60ch" | grep -v "500px")

if [ -z "$hardcoded_widths" ]; then
    echo "✅ No problematic hardcoded max-widths found!"
else
    echo "❌ Found hardcoded max-widths that should use design system variables:"
    echo "$hardcoded_widths"
fi

echo ""
echo "📊 Checking for hardcoded padding in containers..."
hardcoded_padding=$(grep -r "padding: [0-9]" src/views/ --include="*.vue" | grep -v "var(" | head -5)

if [ -z "$hardcoded_padding" ]; then
    echo "✅ No hardcoded padding found in first check!"
else
    echo "⚠️  Found some hardcoded padding (sample):"
    echo "$hardcoded_padding"
    echo "Consider using design system spacing variables like var(--spacing-lg)"
fi

echo ""
echo "📊 Checking for consistent container classes..."
unified_containers=$(grep -r "unified-container\|container-page\|container-standard" src/views/ --include="*.vue" | wc -l)
echo "✅ Found $unified_containers usages of standardized container classes"

echo ""
echo "📊 Checking for StandardPageLayout usage..."
standard_layouts=$(grep -r "StandardPageLayout" src/views/ --include="*.vue" | wc -l)
echo "✅ Found $standard_layouts pages using StandardPageLayout"

echo ""
echo "🎯 Design System Variables Status:"
echo "   --page-content-max-width: 1200px (standard content)"
echo "   --page-container-max-width: 1400px (extended layout)" 
echo "   --page-narrow-width: 720px (reading optimized)"
echo "   --spacing-lg: ~2rem (desktop padding)"
echo "   --spacing-md: ~1rem (mobile padding)"

echo ""
echo "💡 Quick fixes for remaining issues:"
echo "   1. Replace 'max-width: 1200px' with 'var(--page-content-max-width)'"
echo "   2. Replace 'max-width: 1400px' with 'var(--page-container-max-width)'"
echo "   3. Replace 'padding: 2rem' with 'var(--spacing-lg)'"
echo "   4. Use .container-standard or .container-extended classes"
echo ""

echo "🚀 Container system standardization complete!"