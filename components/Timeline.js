import { View, Text, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import typography from '../constants/typography';

// Work progress timeline
// steps = [{ title, time, subtitle, done, active }]
export default function Timeline({ steps = [] }) {
  if (!steps.length) return null;

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const isDone = step.done !== false;
        const dotColor = isDone ? colors.green : colors.placeholder;

        return (
          <View key={index} style={styles.row}>
            {/* Indicator column */}
            <View style={styles.indicatorColumn}>
              <View style={[styles.dot, { backgroundColor: dotColor }]} />
              {!isLast && <View style={styles.line} />}
            </View>

            {/* Content column */}
            <View style={[styles.contentColumn, !isLast && styles.contentSpaced]}>
              <Text style={styles.title}>{step.title}</Text>
              {step.time ? <Text style={styles.time}>{step.time}</Text> : null}
              {step.subtitle ? <Text style={styles.subtitle}>{step.subtitle}</Text> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
  },
  indicatorColumn: {
    alignItems: 'center',
    width: 20,
    marginRight: 14,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: 34,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  contentColumn: {
    flex: 1,
  },
  contentSpaced: {
    paddingBottom: 22,
  },
  title: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
  },
  time: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    marginTop: 3,
  },
  subtitle: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    marginTop: 3,
  },
});
