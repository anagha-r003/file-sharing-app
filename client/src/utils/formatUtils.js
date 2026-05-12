// Storage formatting utilities
export const formatStorageSize = (mb) => {
  if (mb < 1 && mb > 0) return `${mb.toFixed(2)} MB`;
  return `${Math.round(mb)} MB`;
};

export const formatStorageGB = (mb) => {
  return `${(mb / 1024).toFixed(2)} GB`;
};

// Pagination helpers
export const getPaginationRange = (page, totalPages, delta = 2) => {
  const range = [];
  for (
    let i = Math.max(1, page - delta);
    i <= Math.min(totalPages, page + delta);
    i++
  ) {
    range.push(i);
  }
  return range;
};