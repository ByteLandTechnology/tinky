const ESC = "\u001B[";

export const cursorTo = (x: number, y?: number): string => {
  if (typeof x !== "number") {
    throw new TypeError("The `x` argument is required");
  }

  if (typeof y !== "number") {
    return `${ESC}${x + 1}G`;
  }

  return `${ESC}${y + 1};${x + 1}H`;
};

export const cursorUp = (count = 1): string => `${ESC}${count}A`;
export const cursorNextLine = `${ESC}E`;
export const cursorLeft = `${ESC}G`;
export const cursorForward = (count = 1): string => `${ESC}${count}C`;

export const eraseEndLine = `${ESC}K`;
export const eraseLine = `${ESC}2K`;

export const eraseLines = (count: number): string => {
  let clear = "";

  for (let i = 0; i < count; i += 1) {
    clear += eraseLine + (i < count - 1 ? cursorUp() : "");
  }

  if (count) {
    clear += cursorLeft;
  }

  return clear;
};

export const clearTerminal = `${ESC}2J${ESC}3J${ESC}H`;

const ansiEscapes = {
  cursorTo,
  cursorUp,
  cursorNextLine,
  cursorLeft,
  cursorForward,
  eraseEndLine,
  eraseLine,
  eraseLines,
  clearTerminal,
};

export default ansiEscapes;
