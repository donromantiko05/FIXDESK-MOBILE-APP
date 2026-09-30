import colors from './colors';
 
// Badge colors and labels for ticket priority.
const priority = {
  critical: { label: 'Critical', color: colors.danger, background: '#F8E1E1' },
  high: { label: 'High', color: '#C2620F', background: '#FCE9D6' },
  medium: { label: 'Medium', color: '#A87A10', background: '#FAF0D2' },
  low: { label: 'Low', color: colors.green, background: '#DDEDE4' },
};
 
export default priority;
 