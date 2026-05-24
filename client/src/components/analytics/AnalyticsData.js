export const WEEKLY_ACTIVITY = {
  uploads: [1, 2, 0, 1, 2, 0, 0],
  downloads: [2, 1, 3, 2, 4, 1, 2],
  labels: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
};

export const SHARES_TREND = {
  weekly: {
    data: [2, 4, 1, 3, 5, 1, 3],
    labels: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
  },
  monthly: {
    data: [3, 5, 2, 6, 4, 7, 3, 8, 5, 4, 6, 9],
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
  },
};

export const SHARES_DAY = [2, 4, 1, 3, 5, 1, 3];

export const PEAK_HOURS = [
  0, 0, 0, 0, 0, 1, 2, 3, 1, 2, 3, 4, 5, 4, 3, 4, 5, 3, 2, 1, 1, 0, 0, 0,
];

export const SHARE_STATUS = { active: 3, expired: 1, revoked: 0 };

export const LARGEST_FILES = [
  {
    name: "sample-speech-5m.mp3",
    size: "4.6 MB",
    bytes: 4600,
    color: "#ef9f27",
  },
  { name: "images.jpeg", size: "7.4 KB", bytes: 7.4, color: "#378add" },
  { name: "VaultActions.jsx", size: "1.3 KB", bytes: 1.3, color: "#a78bfa" },
];
