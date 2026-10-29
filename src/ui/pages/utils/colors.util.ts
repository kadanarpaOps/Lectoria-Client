
const colors = [
  'linear-gradient(135deg, #2c1810, #8b4513)',
  'linear-gradient(135deg, #1a1a2e, #0f3460)',
  'linear-gradient(135deg, #0d1b2a, #2d3a4a)',
  'linear-gradient(135deg, #1c0a2e, #4a1a8a)',
  'linear-gradient(135deg, #0a1628, #103a5e)',
  'linear-gradient(135deg, #1a0a0a, #6b2020)',
]

export const getRandomColor = (): string => {
    const randomPosition = Math.floor(Math.random() * colors.length);
    return colors[randomPosition];
}
