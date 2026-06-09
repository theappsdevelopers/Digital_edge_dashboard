const { getModel } = require('../../config/requestContext');

async function generateForecast({ scenario = 'baseline', months_ahead = 12, assumptions = {} }) {
  const Payment = getModel('Payment');
  const Expense = getModel('Expense');
  const Milestone = getModel('Milestone');
  const Project = getModel('Project');
  const Employee = getModel('Employee');
  const HeadcountSnapshot = getModel('HeadcountSnapshot');
  const ForecastRevenue = getModel('ForecastRevenue');
  const ForecastExpense = getModel('ForecastExpense');

  const {
    expected_revenue_per_month = 0,
    expected_expenses_per_month = 0,
  } = assumptions;

  const [payments, expenses, milestones, projects, employees, headcountSnapshots] =
    await Promise.all([
      Payment.find({}).lean(),
      Expense.find({}).lean(),
      Milestone.find({}).lean(),
      Project.find({}).lean(),
      Employee.find({}).lean(),
      HeadcountSnapshot.find({}).lean(),
    ]);

  const today = new Date();
  const forecastRevenue = [];
  const forecastExpense = [];

  const getMonthString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const getQuarter = (date) => {
    const year = date.getFullYear();
    const quarter = Math.floor(date.getMonth() / 3) + 1;
    return `${year}-Q${quarter}`;
  };

  const sixMonthsAgo = new Date(today);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const last6MonthsPayments = payments
    .filter((p) => {
      if (!p.paymentDate) return false;
      const paymentDate = new Date(p.paymentDate);
      return paymentDate >= sixMonthsAgo && paymentDate <= today;
    })
    .sort(
      (a, b) => new Date(a.paymentDate) - new Date(b.paymentDate)
    );

  const monthlyRevenue = {};
  last6MonthsPayments.forEach((p) => {
    const month = p.month;
    if (!month) return;
    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (p.amount || 0);
  });

  const revenueValues = Object.values(monthlyRevenue);
  const avgMonthlyRevenue =
    revenueValues.length > 0
      ? revenueValues.reduce((a, b) => a + b, 0) / revenueValues.length
      : 0;

  const last6MonthsExpenses = expenses.filter((e) => {
    if (!e.date) return false;
    const expenseDate = new Date(e.date);
    return expenseDate >= sixMonthsAgo && expenseDate <= today;
  });

  const expenseByType = {};
  last6MonthsExpenses.forEach((e) => {
    const type = e.expenseType;
    if (!type) return;
    if (!expenseByType[type]) {
      expenseByType[type] = [];
    }
    expenseByType[type].push(e.amount || 0);
  });

  const avgExpenseByType = {};
  Object.keys(expenseByType).forEach((type) => {
    const values = expenseByType[type];
    avgExpenseByType[type] =
      values.reduce((a, b) => a + b, 0) / values.length;
  });

  const activeEmployees = employees.filter((e) => e.status === 'Active');
  const totalMonthlySalaryCost = activeEmployees.reduce(
    (sum, e) => sum + (e.monthlyCost || 0),
    0
  );

  for (let i = 1; i <= months_ahead; i++) {
    const forecastDate = new Date(today);
    forecastDate.setMonth(forecastDate.getMonth() + i);
    const monthStr = getMonthString(forecastDate);
    const quarterStr = getQuarter(forecastDate);
    const yearNum = forecastDate.getFullYear();

    const milestonesInMonth = milestones.filter((m) => {
      if (m.status === 'Paid') return false;
      if (!m.dueDate) return false;
      const dueDate = new Date(m.dueDate);
      return (
        dueDate.getFullYear() === forecastDate.getFullYear() &&
        dueDate.getMonth() === forecastDate.getMonth()
      );
    });

    let milestoneRevenue = 0;
    milestonesInMonth.forEach((m) => {
      const project = projects.find(
        (p) => String(p._id) === String(m.project)
      );
      if (project && project.status !== 'Cancelled') {
        milestoneRevenue += m.value || 0;
      }
    });

    const baseRevenue =
      expected_revenue_per_month > 0
        ? expected_revenue_per_month
        : avgMonthlyRevenue;

    let projectedRevenue = 0;
    let sourceType = 'trend_based';
    let confidenceLevel = 'medium';

    if (milestoneRevenue > 0 && baseRevenue > 0) {
      projectedRevenue = milestoneRevenue * 0.7 + baseRevenue * 0.3;
      sourceType = 'hybrid';
      confidenceLevel = 'high';
    } else if (milestoneRevenue > 0) {
      projectedRevenue = milestoneRevenue;
      sourceType = 'milestone_based';
      confidenceLevel = 'high';
    } else {
      projectedRevenue = baseRevenue;
      sourceType = 'trend_based';
      confidenceLevel = 'medium';
    }

    forecastRevenue.push({
      month: monthStr,
      quarter: quarterStr,
      year: yearNum,
      projectedAmount: projectedRevenue,
      sourceType,
      confidenceLevel,
      scenario,
    });

    if (expected_expenses_per_month > 0) {
      forecastExpense.push({
        month: monthStr,
        quarter: quarterStr,
        year: yearNum,
        projectedAmount: expected_expenses_per_month,
        expenseType: 'Other',
        confidenceLevel: 'high',
        scenario,
      });
    } else {
      if (totalMonthlySalaryCost > 0) {
        forecastExpense.push({
          month: monthStr,
          quarter: quarterStr,
          year: yearNum,
          projectedAmount: totalMonthlySalaryCost,
          expenseType: 'Salary',
          confidenceLevel: 'high',
          scenario,
        });
      }

      Object.keys(avgExpenseByType).forEach((expenseType) => {
        if (expenseType === 'Salary') return;
        forecastExpense.push({
          month: monthStr,
          quarter: quarterStr,
          year: yearNum,
          projectedAmount: avgExpenseByType[expenseType],
          expenseType,
          confidenceLevel: 'medium',
          scenario,
        });
      });
    }
  }

  await Promise.all([
    ForecastRevenue.deleteMany({ scenario }),
    ForecastExpense.deleteMany({ scenario }),
  ]);

  await Promise.all([
    ForecastRevenue.insertMany(forecastRevenue),
    ForecastExpense.insertMany(forecastExpense),
  ]);

  return {
    revenueCount: forecastRevenue.length,
    expenseCount: forecastExpense.length,
  };
}

module.exports = {
  generateForecast,
};

