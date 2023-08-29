export const last = (arr: any[]) => {
  if (!arr || !arr.length) return null;
  return arr[arr.length - 1];
};
