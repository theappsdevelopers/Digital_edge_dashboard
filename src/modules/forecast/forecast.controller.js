const { generateForecast } = require('./forecast.service');

async function postForecast(req, res) {
  try {
    const { scenario = 'baseline', months_ahead = 12, assumptions = {} } = req.body || {};

    const { revenueCount, expenseCount } = await generateForecast({
      scenario,
      months_ahead,
      assumptions,
    });

    res.json({
      success: true,
      message: `Generated ${revenueCount} revenue and ${expenseCount} expense forecasts for scenario: ${scenario}`,
      months_ahead,
      scenario,
    });
  } catch (error) {
    console.error('Forecast generation error:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  postForecast,
};

