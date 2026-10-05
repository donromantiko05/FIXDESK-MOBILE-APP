import colors from './colors';
 
// Dot colors and labels for ticket status.
const status = {
  unassigned: { label: 'Unassigned', color: colors.textPrimary },
  accepted: { label: 'Accepted', color: colors.primary },
  assigned: { label: 'Technician assigned', color: colors.primary },
  in_progress: { label: 'Repair in progress', color: colors.primary },
  parts_ordered: { label: 'Parts ordered', color: colors.textSecondary },
  on_hold: { label: 'On hold', color: colors.textSecondary },
  completed: { label: 'Completed', color: colors.green },
  resolved: { label: 'Completed', color: colors.green },
  evaluating: { label: 'Evaluating priority…', color: colors.textSecondary },
};
 
export default status;
 
