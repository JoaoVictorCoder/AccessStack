import { getAnalyticsOverview, getFraudInsights } from "../services/analyticsService.js";

export async function analyticsOverviewHandler(_req, res) {
  const data = await getAnalyticsOverview();
  return res.json(data);
}

export async function analyticsFraudHandler(_req, res) {
  const data = await getFraudInsights();
  return res.json(data);
}
