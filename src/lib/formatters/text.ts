export const formatName = (name?: string | null) => {
  if (!name) {
    return "";
  }
  // Split the name into words and capitalize each one
  return name
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .trim();
};
