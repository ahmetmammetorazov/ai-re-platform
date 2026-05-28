import axios from "axios";

import { extractScripts } from "../utils/extractScripts.js";

import { detectNextJS } from "../detectors/next.detector.js";
import { detectReact } from "../detectors/react.detector.js";
import { detectVue } from "../detectors/vue.detector.js";
import { detectTailwind } from "../detectors/tailwind.detector.js";

export const analyzeWebsiteService = async (url) => {
  const response = await axios.get(url);

  const html = response.data;

  const scripts = extractScripts(html);

  const technologies = [];

  if (detectNextJS(html, scripts)) {
    technologies.push("Next.js");
  }

  if (detectReact(html, scripts)) {
    technologies.push("React");
  }

  if (detectVue(html, scripts)) {
    technologies.push("Vue");
  }

  if (detectTailwind(html)) {
    technologies.push("Tailwind CSS");
  }

  return {
    url,
    technologies,
    scripts,
  };
};
