// Averages ingredient colors (hex strings like '#bfe3d0') into a single
// blended color for the mixer bowl's liquid fill — channel-by-channel mean,
// no gamma correction (subtle UI tint, not a color-accurate blend).
export function blendHexColors(colors: string[]): number {
  if (colors.length === 0) return 0xffffff;

  let r = 0;
  let g = 0;
  let b = 0;
  colors.forEach((hex) => {
    const n = parseInt(hex.replace('#', ''), 16);
    r += (n >> 16) & 0xff;
    g += (n >> 8) & 0xff;
    b += n & 0xff;
  });

  const count = colors.length;
  return (Math.round(r / count) << 16) | (Math.round(g / count) << 8) | Math.round(b / count);
}
