import colors from './colors';
 
// Dot colors and labels for ticket status.
const status = {
  unassigned: { label: 'Unassigned', color: colors.textPrimary },
  assigned: { label: 'Technician assigned', color: colors.primary },
  in_progress: { label: 'Repair in progress', color: colors.primary },
  completed: { label: 'Completed', color: colors.green },
  resolved: { label: 'Completed', color: colors.green },
  evaluating: { label: 'Evaluating priority…', color: colors.textSecondary },
};
 
export default status;
 