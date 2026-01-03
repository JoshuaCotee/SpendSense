import React, { useMemo, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import ScreenWrapper from "@components/ScreenWrapper";
import TransactionList from "@components/TransactionList";
import { Svg, Path, G } from "react-native-svg";
import { ScrollView } from "react-native";
import { useModal } from "@context/ModalContext";
import { EditTransaction } from "@components/modal/EditTransaction";
import { Transaction } from "@context/TransactionsContext";
import { useUserProfile } from "@context/UserProfileContext";
import { useTheme } from "@context/ThemeContext";
import { useGoals } from "@context/GoalsContext";
import { useTransactions } from "@context/TransactionsContext";
import { useCurrency } from "@context/CurrencyContext";
import { calculateNetIncome, calculateMonthlySavings, calculateOverallGoalsProgress, findClosestGoal } from "@utils/calculations";
import type { AppNavigation } from "@app-types/navigation";

export default React.memo(function HomeScreen() {
  const navigation = useNavigation() as AppNavigation;
  const { profile } = useUserProfile();
  const { openModal, closeModal } = useModal();
  const { theme } = useTheme();
  const { goals } = useGoals();
  const { transactions } = useTransactions();
  const { selectedCurrency } = useCurrency();
  
  const displayName = useMemo(() => profile.firstName || "Mister", [profile.firstName]);

  const netIncome = useMemo(() => calculateNetIncome(transactions), [transactions]);

  const monthlySavings = useMemo(() => calculateMonthlySavings(transactions), [transactions]);

  const closestGoal = useMemo(() => findClosestGoal(goals, netIncome), [goals, netIncome]);

  const goalsProgress = useMemo(() => calculateOverallGoalsProgress(goals, netIncome), [goals, netIncome]);

  const handleTransactionPress = useCallback((transaction: Transaction) => {
    openModal(
      <EditTransaction
        transaction={transaction}
        onClose={closeModal}
        navigation={navigation}
      />
    );
  }, [openModal, closeModal, navigation]);

  const dynamicStyles = useMemo(() => ({
    container: { backgroundColor: theme.colors.background },
    profileTitle: { color: theme.colors.text },
    profileSubtitle: { color: theme.colors.textSecondary },
    streakCounter: { borderColor: theme.colors.border, backgroundColor: theme.colors.card },
    streakCount: { color: theme.colors.text },
    tabTitle: { color: theme.colors.text },
    tabTitleBox: { color: theme.colors.text },
  }), [theme]);

  return (
    <ScreenWrapper edges={['left', 'right', 'top']}>
      <ScrollView 
        style={[styles.container, dynamicStyles.container]} 
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileContainer}>
          <View style={styles.profileContainerLeft}>
            <View style={styles.profileContent}>
              <Text style={[styles.profileTitle, dynamicStyles.profileTitle]}>Hello, {displayName}!</Text>
              <Text style={[styles.profileSubtitle, dynamicStyles.profileSubtitle]}>Your finances are looking good!</Text>
            </View>
          </View>
          <View style={styles.profileContainerRight}>
            <View style={[styles.streakCounter, dynamicStyles.streakCounter]}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={[styles.streakCount, dynamicStyles.streakCount]}>05</Text>
            </View>
          </View>
        </View>

        <View style={styles.homeTabContainer}>
          <View style={styles.homeGrids}>
            <View style={styles.homeGridBox}>
              <View style={styles.homeGridBoxIcon}>
                <Svg width="25" height="25" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"
                    fill="#ffffff"
                  />
                </Svg>
              </View>
              <View style={styles.savingsTextContainer}>
                <Text style={styles.homeGridText}>Savings </Text>
                <Text style={styles.homeGridTextSmall}>(This month)</Text>
              </View>
              <Text style={styles.homeGridValue}>
                {selectedCurrency.symbol}{monthlySavings.toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.homeGridBox, styles.homeGridGoalBox]}
              onPress={() => navigation.navigate('Goals' as never)}
              activeOpacity={0.8}
            >
              <View style={[styles.homeGridBoxIcon, styles.homeGridBoxIconGoals]}>
                <Svg width="25" height="25" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
                    fill="#ffffff"
                  />
                  <Path
                    d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"
                    fill="#ffffff"
                  />
                </Svg>
              </View>
              <Text style={styles.homeGridText}>
                {goals.length === 0 ? 'Click to setup a Goal' : `Goals${closestGoal ? ` (${closestGoal.title})` : ''}`}
              </Text>
              {goals.length > 0 && (
                <View style={styles.goalProgressContainer}>
                  <View
                    style={[
                      styles.goalProgressBar,
                      {
                        width: `${Math.min(100, goalsProgress * 100)}%`,
                      },
                    ]}
                  />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.recentTransactions}>
          <Text style={[styles.tabTitleBox, dynamicStyles.tabTitleBox]}>Recent Transactions</Text>
          <TransactionList 
            maxItems={10} 
            scrollEnabled={false}
            onTransactionPress={handleTransactionPress}
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: -30,
    fontFamily: "Space Grotesk",
  },
  profileContainer: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    alignSelf: "center",
    borderRadius: 80,
    marginTop: 20,
    paddingHorizontal: 25,
  },
  profileContainerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  profileContent: {
    flexDirection: "column",
  },
  profileTitle: {
    fontFamily: "Space Grotesk",
    fontSize: 20,
    fontWeight: "700",
  },
  profileSubtitle: {
    fontFamily: "Space Grotesk",
    fontWeight: "500",
    fontSize: 14,
    marginTop: 2,
    opacity: 0.6,
  },
  profileContainerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  streakCounter: {
    borderWidth: 1,
    borderColor: "#e1e1e1",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 60,
    borderRadius: 13,
    paddingHorizontal: 15,
    paddingLeft: 10,
  },
  streakEmoji: {
    fontSize: 14,
  },
  streakCount: {
    fontFamily: "Space Grotesk",
    fontSize: 18,
    fontWeight: "700",
  },
  homeTabContainer: {
    margin: 25,
    marginTop: 0,
    marginBottom: 0,
  },
  tabTitle: {
    fontWeight: "700",
    fontSize: 18,
    fontFamily: "Space Grotesk",
  },
  tabTitleBox: {
    fontWeight: "700",
    fontSize: 18,
    paddingBottom: 15,
    fontFamily: "Space Grotesk",
  },
  homeGrids: {
    marginVertical: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
  },
  homeGridBox: {
    backgroundColor: "#a46de3",
    padding: 15,
    borderRadius: 14,
    flex: 1,
  },
  homeGridBoxIcon: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8c59c9",
    borderRadius: 100,
    marginBottom: 15,
  },
  homeGridBoxIconGoals: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1b7a63",
    borderRadius: 100,
    marginBottom: 15,
  },
  homeGridText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  savingsTextContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    flexWrap: "wrap",
  },
  homeGridTextSmall: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.9,
  },
  homeGridValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  homeGridGoalBox: {
    backgroundColor: "#239579",
  },
  goalProgressContainer: {
    backgroundColor: "#11473a",
    height: 20,
    borderRadius: 8,
    marginTop: 10,
    padding: 3,
  },
  goalProgressBar: {
    height: "100%",
    width: 45,
    borderRadius: 18,
    backgroundColor: "#b4ffed",
  },
  recentTransactions: {
    marginTop: 10,
    margin: 25,
    borderRadius: 14,
  },
});