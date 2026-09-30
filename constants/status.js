import colors from './colors';
 
// Dot colors and labels for ticket status.
const status = {
  unassigned: { label: 'Unassigned', color: colors.textPrimary },
  assigned: { label: 'Assigned', color: colors.primary },
  in_progress: { label: 'In Progress', color: colors.purple },
  resolved: { label: 'Resolved', color: colors.green },
};
 
export default status;
 