export const logError = (error: unknown) => {
  if (process.env.MORTADELO_DEBUG) {
    console.error(error);
  }
};

export const debug = (...args: unknown[]) => {
  if (process.env.MORTADELO_DEBUG) {
    console.log(...args);
  }
};
