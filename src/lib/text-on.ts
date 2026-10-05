function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Black or white text, whichever reads better on the colour (by WCAG contrast). Black wins on all the palette
 * colours but the dark blue, which also keeps the lighter top of a tile's gradient above 3:1.
 */
export function textOn(hex: string): '#000000' | '#ffffff' {
  return luminance(hex) > 0.179 ? '#000000' : '#ffffff';
}
