import { analyzeWebsiteService } from "../services/analysis.service.js";

export const analyzeWebsite = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "URL is required",
      });
    }

    const analysis = await analyzeWebsiteService(url);

    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to analyze website",
    });
  }
};
