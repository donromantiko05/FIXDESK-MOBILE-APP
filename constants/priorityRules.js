const CATEGORY_CRITICALITY = {
  Electrical: 85,
  HVAC: 65,
  Plumbing: 60,
  'IT Equipment': 65,
  Furniture: 30,
  Other: 35,
};
const URGENT_WORDS = ['urgent', 'immediately', 'unsafe', 'danger', 'outage', 'cannot work'];
const KEYWORD_GROUPS = [
  { score: 100, words: ['fire', 'smoke', 'flood', 'shock', 'injury', 'gas leak'] },
  { score: 90, words: ['spark', 'sparking', 'exposed wire', 'server down', 'no power'] },
  { score: 72, words: ['leak', 'overheat', 'not working', 'broken', 'blocked'] },
];

export const scoreTicketPriority = ({
  category = 'Other',
  description = '',
  incidentCount = 0,
  reporterUrgent = false,
} = {}) => {
  const text = String(description).toLowerCase();
  const categoryScore = CATEGORY_CRITICALITY[category] || CATEGORY_CRITICALITY.Other;
  const keyword = KEYWORD_GROUPS.find((group) => group.words.some((word) => text.includes(word)));
  const keywordScore = keyword?.score || 20;
  const equipmentScore = Math.min(100, Math.max(0, Number(incidentCount) * 25));
  const urgency = reporterUrgent || URGENT_WORDS.some((word) => text.includes(word));
  const urgencyScore = urgency ? 100 : 20;
  const score = Math.round(
    categoryScore * 0.35 +
    keywordScore * 0.35 +
    equipmentScore * 0.15 +
    urgencyScore * 0.15
  );
  const priority = score >= 85 ? 'critical' : score >= 60 ? 'high' : score >= 35 ? 'medium' : 'low';

  return {
    score,
    priority,
    factors: [
      { title: 'Category criticality', detail: category + ' category risk', percent: categoryScore },
      { title: 'Keyword detection', detail: keyword ? 'Matched: ' + keyword.words.find((word) => text.includes(word)) : 'No urgent issue keyword', percent: keywordScore },
      { title: 'Equipment history', detail: incidentCount ? incidentCount + ' prior incidents' : 'No prior incidents recorded', percent: equipmentScore },
      { title: 'Reporter urgency', detail: urgency ? 'Reporter marked issue urgent' : 'No urgent flag detected', percent: urgencyScore },
    ],
  };
};
