import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { useTheme } from '@context/ThemeContext';
import { useCurrency } from '@context/CurrencyContext';
import { AnalyticsData } from '@utils/calculations';

interface StatCardsProps {
  analytics: AnalyticsData;
  viewMode: 'month' | 'year';
}

export const StatCards: React.FC<StatCardsProps> = ({ analytics, viewMode }) => {
  const { theme } = useTheme();
  const { selectedCurrency } = useCurrency();

  const dynamicStyles = {
    statCard: { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight },
    statLabel: { color: theme.colors.textSecondary },
    statValue: { color: theme.colors.text },
  };

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        {viewMode === 'month' ? 'Monthly' : 'Yearly'} Statistics
      </Text>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.incomeCard, dynamicStyles.statCard]}>
          <View style={styles.statIcon}>
            <Svg width="24" height="24" viewBox="0 0 16 16" fill="none">
              <Path
                d="M12.29935 7.24129375c0 0.58405 -0.6322625 0.9490875 -1.13806875 0.65705625 -0.50580625 -0.292025 -0.50580625 -1.02209375 0 -1.31411875 0.11533125 -0.0665875 0.2461875 -0.10164375 0.37935625 -0.10165 0.419025 0 0.7587125 0.3396875 0.7587125 0.7587125Zm-2.52903125 -3.28774375h-2.52903125c-0.38936875 0 -0.632725 0.42150625 -0.43804375 0.7587125 0.09035625 0.15649375 0.2573375 0.2529 0.43804375 0.2529h2.52903125c0.38936875 0 0.632725 -0.42150625 0.4380375 -0.75870625 -0.09035 -0.1565 -0.25733125 -0.25290625 -0.4380375 -0.25290625Zm6.06966875 3.0348375v2.023225c0 0.838075 -0.67934375 1.51745625 -1.5174125 1.51741875h-0.1492125l-1.02489375 2.86918125c-0.143775 0.4027 -0.5252125 0.67150625 -0.9528125 0.6714625h-0.80423125c-0.42759375 0.00004375 -0.80903125 -0.2687625 -0.9528125 -0.67145625l-0.12139375 -0.34015625h-3.6228375l-0.12139375 0.34015625c-0.143775 0.40269375 -0.5252125 0.6715 -0.9528125 0.67145625H4.81594375c-0.42759375 0.00004375 -0.80903125 -0.2687625 -0.9528125 -0.67145625l-0.79474375 -2.22301875c-0.75606875 -0.8557 -1.22948125 -1.92398125 -1.3555625 -3.0588625 -0.3326875 0.1747375 -0.54109375 0.51949375 -0.5412125 0.895275 0 0.38936875 -0.42150625 0.632725 -0.7587125 0.43804375 -0.15649375 -0.09035625 -0.2529 -0.2573375 -0.2529 -0.43804375 0.0015875 -0.9281 0.63443125 -1.73609375 1.535125 -1.96 0.23429375 -2.890275 2.64640625 -5.1176 5.5461625 -5.1212875h6.57548125c0.38936875 0 0.632725 0.42150625 0.4380375 0.7587125 -0.09035625 0.15649375 -0.25733125 0.2529 -0.4380375 0.2529h-1.3524c0.8394125 0.58894375 1.4995875 1.398575 1.90751875 2.33935625 0.0271875 0.063225 0.05374375 0.12645 0.07903125 0.189675 0.78755625 0.06685 1.39190625 0.7270375 1.38906875 1.51741875Zm-1.0116125 0c0 -0.27935 -0.22645625 -0.50580625 -0.50580625 -0.50580625h-0.23140625c-0.2210875 0.0002375 -0.4167125 -0.14315625 -0.48304375 -0.3540625 -0.5947875 -1.8980875 -2.3545125 -3.1890625 -4.34360625 -3.18658125h-2.023225c-3.50433125 -0.00021875 -5.694725 3.7931875 -3.94275 6.8281375 0.16568125 0.2870125 0.3622125 0.555075 0.58609375 0.79941875 0.0456375 0.04963125 0.08089375 0.1078875 0.1036875 0.17134375l0.827625 2.317225h0.80423125l0.241525 -0.6758875c0.07185 -0.2012375 0.2624125 -0.3356125 0.4760875 -0.335725h4.336025c0.21368125 0.0001125 0.4042375 0.1344875 0.47609375 0.335725l0.24151875 0.6758875h0.80423125l1.14501875 -3.2049125c0.07185 -0.20124375 0.2624125 -0.33561875 0.47609375 -0.33573125h0.50580625c0.2793375 -0.0000125 0.50580625 -0.22646875 0.50580625 -0.50580625Z"
                fill="#4fa135"
              />
            </Svg>
          </View>
          <Text style={[styles.statLabel, dynamicStyles.statLabel]}>Income</Text>
          <Text style={[styles.statValue, { color: theme.colors.success }]}>
            {selectedCurrency.symbol}{analytics.income.toFixed(2)}
          </Text>
        </View>

        <View style={[styles.statCard, styles.expenseCard, dynamicStyles.statCard]}>
          <View style={styles.statIcon}>
            <Svg width="24" height="24" viewBox="0 0 16 16" fill="none">
              <Path
                d="M13.31536875 2.57909375C12.405475 1.0193875 11.160125 0.16 9.80923125 0.16H6.19076875c-1.35089375 0 -2.59624375 0.85938125 -3.5061375 2.41909375C1.83429375 4.036275 1.36615625 5.9646125 1.36615625 8s0.4681375 3.963725 1.318475 5.42090625C3.594525 14.9806125 4.839875 15.84 6.19076875 15.84h3.6184625c1.35089375 0 2.59624375 -0.8593875 3.5061375 -2.41909375 0.8503375 -1.45718125 1.318475 -3.38551875 1.318475 -5.42090625s-0.4681375 -3.963725 -1.318475 -5.42090625Zm0.09649375 4.81783125h-2.41230625c-0.04711875 -1.23754375 -0.29351875 -2.4593875 -0.729725 -3.6184625h2.3060125c0.46135625 1.00864375 0.7659125 2.2615375 0.83601875 3.6184625ZM11.8589375 2.57230625h-2.1658c-0.2519 -0.4369875 -0.5556375 -0.84196875 -0.9046125 -1.20615h1.02070625c0.75384375 0 1.4624625 0.45230625 2.04970625 1.20615ZM2.57230625 8c0 -3.59584375 1.6584625 -6.63384375 3.6184625 -6.63384375S9.80923125 4.40415625 9.80923125 8s-1.6584625 6.63384375 -3.6184625 6.63384375S2.57230625 11.59584375 2.57230625 8Zm7.236925 6.63384375h-1.01844375c0.348975 -0.36418125 0.6527125 -0.7691625 0.9046125 -1.20615h2.1658c-0.58950625 0.75384375 -1.298125 1.20615 -2.05196875 1.20615Zm2.7666125 -2.41230625h-2.30525625c0.4362 -1.159075 0.68260625 -2.38091875 0.72971875 -3.6184625h2.4123125c-0.0708625 1.356925 -0.37541875 2.60981875 -0.836775 3.6184625Z"
                fill={theme.colors.error}
              />
            </Svg>
          </View>
          <Text style={[styles.statLabel, dynamicStyles.statLabel]}>Expense</Text>
          <Text style={[styles.statValue, { color: theme.colors.error }]}>
            {selectedCurrency.symbol}{analytics.expense.toFixed(2)}
          </Text>
        </View>

        <View style={[styles.statCard, styles.netCard, dynamicStyles.statCard]}>
          <View style={styles.statIcon}>
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke={theme.colors.primary}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M2 17L12 22L22 17"
                stroke={theme.colors.primary}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M2 12L12 17L22 12"
                stroke={theme.colors.primary}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <Text style={[styles.statLabel, dynamicStyles.statLabel]}>Net</Text>
          <Text style={[styles.statValue, { color: analytics.net >= 0 ? theme.colors.success : theme.colors.error }]}>
            {selectedCurrency.symbol}{Math.abs(analytics.net).toFixed(2)}
          </Text>
        </View>

        <View style={[styles.statCard, styles.countCard, dynamicStyles.statCard]}>
          <View style={styles.statIcon}>
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <Path
                d="M9 11L12 14L22 4"
                stroke={theme.colors.primary}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16"
                stroke={theme.colors.primary}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <Text style={[styles.statLabel, dynamicStyles.statLabel]}>Transactions</Text>
          <Text style={[styles.statValue, dynamicStyles.statValue]}>
            {analytics.transactionCount}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Space Grotesk",
    color: "#111",
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '47%',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  incomeCard: {
    borderLeftWidth: 4,
  },
  expenseCard: {
    borderLeftWidth: 4,
  },
  netCard: {
    borderLeftWidth: 4,
  },
  countCard: {
    borderLeftWidth: 4,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Space Grotesk",
    marginBottom: 8,
    fontWeight: "500",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Space Grotesk",
  },
});

