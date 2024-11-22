export const renderInitials = (text) => {
  try {
    if (text && text.includes(" ")) {
      return text
        .split(" ")
        .map((word) => word[0].toUpperCase())
        .join("");
    } else if (text) {
      return text[0].toUpperCase();
    }
    return "R";
  } catch (e) {
    console.error(`RENDER_INITIALS_ERROR:${text} message:${e.message} err:${e} `);
    return "R";
  }
};
