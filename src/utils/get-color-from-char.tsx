export const getColorFromChar = (str: string = "") => {
  const colors = [
    "#1677ff", // blue
    "#52c41a", // green
    "#faad14", // yellow
    "#eb2f96", // pink
    "#722ed1", // purple
    "#13c2c2", // cyan
    "#fa8c16", // orange
    "#a0d911", // lime
  ];
  const char = str.charAt(0)?.toLowerCase() || "a";
  return colors[char.charCodeAt(0) % colors.length];
};
