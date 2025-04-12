// Generate a random color
export const getRandomColor = () => {
  const colors = [
    "#FF6B6B", // Red
    "#4ECDC4", // Teal
    "#FFD166", // Yellow
    "#6B5CA5", // Purple
    "#72A1E5", // Blue
    "#FF9F1C", // Orange
    "#2EC4B6", // Turquoise
    "#E71D36", // Bright Red
    "#8FB339", // Green
    "#F39237", // Orange
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Generate a random number between 1 and 99
export const getRandomNumber = () => {
  return Math.floor(Math.random() * 99) + 1;
};
