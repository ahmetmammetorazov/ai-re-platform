export const bundleRules = [
  {
    technology: "React",
    signatures: ["useState", "useEffect", "jsx-runtime", "createElement"],
    minimumMatches: 2,
  },

  {
    technology: "Redux",
    signatures: ["createStore", "combineReducers", "configureStore"],
    minimumMatches: 2,
  },

  {
    technology: "Zustand",
    signatures: ["subscribeWithSelector", "persist", "create"],
    minimumMatches: 2,
  },
];
