/**
 * Weekly Recaps API Endpoints
 * GET /api/weekly-recaps/:week - Get weekly recap for a specific week
 */

/**
 * Get weekly recap for a specific week
 * Week format: YYYY-MM-DD (date within the week)
 */
function getWeeklyRecap(req, res) {
  try {
    const { week } = req.params;

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(week)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    // Parse the date
    const weekDate = new Date(week);
    const weekStart = new Date(weekDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    // Generate sample recap data based on the week
    const recap = {
      week: formatWeekRange(weekStart),
      tasksCompleted: [
        'Dashboard V4 Navigation component',
        'Liquid Glass Design System implementation',
        'Journal page with date picker',
        'Weekly recaps with data visualization',
        'Client management interface'
      ],
      tasksCompletedCount: 5,
      intelligenceReports: 3,
      decisions: [
        'Implemented iOS-style glass morphism for UI',
        'Chose markdown rendering for journal entries',
        'Established two-panel layout for documents',
        'Added real-time processing for DocuDigest'
      ],
      cronJobsExecuted: 24,
      issues: [
        'CSS import timeout on initial load (resolved)',
        'Date picker timezone handling (fixed)'
      ],
      recommendations: [
        'Add caching layer for document previews',
        'Implement batch processing for PDF uploads',
        'Create automated backup system for memory files',
        'Add search indexing for faster document retrieval'
      ]
    };

    res.json(recap);
  } catch (error) {
    console.error('Error fetching weekly recap:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function formatWeekRange(weekStart) {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const options = { month: 'short', day: 'numeric' };
  const startStr = weekStart.toLocaleDateString('en-US', options);
  const endStr = weekEnd.toLocaleDateString('en-US', options);

  return `${startStr} - ${endStr}`;
}

module.exports = {
  routes: [
    { method: 'GET', path: '/api/weekly-recaps/:week', handler: getWeeklyRecap }
  ]
};
