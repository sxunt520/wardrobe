export const formatCategory = (category: string): string => {
  return category.charAt(0).toUpperCase() + category.slice(1);
};

export const getColorName = (color: string): string => {
  const colorMap: Record<string, string> = {
    red: 'Red', blue: 'Blue', green: 'Green', black: 'Black', white: 'White',
  };
  return colorMap[color.toLowerCase()] || color;
};
