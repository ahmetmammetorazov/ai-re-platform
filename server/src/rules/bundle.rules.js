import { TECHNOLOGIES } from "../constants/technologies.js";

export const bundleRules = [
  {
    technology: TECHNOLOGIES.REACT,
    signatures: ["useState", "useEffect", "jsx-runtime", "createElement"],
    minimumMatches: 2,
  },

  {
    technology: TECHNOLOGIES.REDUX,
    signatures: ["createStore", "combineReducers", "configureStore"],
    minimumMatches: 2,
  },

  {
    technology: TECHNOLOGIES.ZUSTAND,
    signatures: ["subscribeWithSelector", "persist", "zustand"],
    minimumMatches: 2,
  },

  {
    technology: TECHNOLOGIES.REACT_QUERY,
    signatures: ["QueryClient", "useQuery", "useMutation"],
    minimumMatches: 2,
  },
];
