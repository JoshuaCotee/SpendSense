import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PageLayout from '@components/PageLayout';
import { useGoals, Goal } from '@context/GoalsContext';
import { useTransactions } from '@context/TransactionsContext';
import { useCurrency } from '@context/CurrencyContext';
import { useAlert } from '@context/AlertContext';
import { useTheme } from '@context/ThemeContext';
import { InputField } from '@components/ui/InputField';
import { SelectField } from '@components/ui/SelectField';
import { CalculatorKeyboard } from '@components/ui/CalculatorKeyboard';
import { Svg, Path } from 'react-native-svg';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

export default function GoalsScreen({ navigation }: any) {
  const { goals, addGoal, updateGoal, deleteGoal } = useGoals();
  const { transactions } = useTransactions();
  const { selectedCurrency } = useCurrency();
  const { showAlert } = useAlert();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [isAdding, setIsAdding] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);

  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [timeframe, setTimeframe] = useState<'month' | 'year' | 'custom' | ''>('');
  const [months, setMonths] = useState('');
  const [years, setYears] = useState('');
  const [customMonths, setCustomMonths] = useState('');
  const [reason, setReason] = useState('');

  const netIncome = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "Income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter((t) => t.type === "Expense")
      .reduce((sum, t) => sum + t.amount, 0);
    return income - expense;
  }, [transactions]);

  const goalsWithProgress = useMemo(() => {
    return goals.map((goal) => {
      let monthsNeeded = 1;
      if (goal.timeframe === 'month' && goal.months) {
        monthsNeeded = goal.months;
      } else if (goal.timeframe === 'year' && goal.years) {
        monthsNeeded = goal.years * 12;
      } else if (goal.timeframe === 'custom' && goal.customMonths) {
        monthsNeeded = goal.customMonths;
      }

      const monthlyContribution = goal.targetAmount / monthsNeeded;

      const totalMonthlyNeeded = goals.reduce((sum, g) => {
        let gMonths = 1;
        if (g.timeframe === 'month' && g.months) {
          gMonths = g.months;
        } else if (g.timeframe === 'year' && g.years) {
          gMonths = g.years * 12;
        } else if (g.timeframe === 'custom' && g.customMonths) {
          gMonths = g.customMonths;
        }
        return sum + (g.targetAmount / gMonths);
      }, 0);

      const proportion = totalMonthlyNeeded > 0 ? monthlyContribution / totalMonthlyNeeded : 1 / goals.length;
      const allocatedAmount = netIncome * proportion;

      const baseAmount = goal.currentAmount || 0;
      let currentAmount = baseAmount;
      
      if (netIncome > 0) {
        const allocatedFromNetIncome = netIncome * proportion;
        currentAmount = Math.min(
          baseAmount + allocatedFromNetIncome,
          goal.targetAmount
        );
      }

      return {
        ...goal,
        currentAmount: Math.min(currentAmount, goal.targetAmount),
        progress: Math.min(1, currentAmount / goal.targetAmount),
        monthlyContribution,
      };
    });
  }, [goals, netIncome]);

  const resetForm = () => {
    setTitle('');
    setTargetAmount('');
    setTimeframe('');
    setMonths('');
    setYears('');
    setCustomMonths('');
    setReason('');
    setIsAdding(false);
    setEditingGoal(null);
  };

  const handleAdd = async () => {
    if (!title.trim()) {
      showAlert({
        title: 'Error',
        message: 'Please enter a goal title',
        type: 'error',
      });
      return;
    }
    if (!targetAmount || parseFloat(targetAmount) <= 0) {
      showAlert({
        title: 'Error',
        message: 'Please enter a valid target amount',
        type: 'error',
      });
      return;
    }
    if (timeframe === 'month' && (!months || parseInt(months) < 1 || parseInt(months) > 12)) {
      showAlert({
        title: 'Error',
        message: 'Please select a valid number of months (1-12)',
        type: 'error',
      });
      return;
    }
    if (timeframe === 'year' && (!years || parseInt(years) < 1 || parseInt(years) > 5)) {
      showAlert({
        title: 'Error',
        message: 'Please select a valid number of years (1-5)',
        type: 'error',
      });
      return;
    }
    if (timeframe === 'custom' && (!customMonths || parseInt(customMonths) <= 0)) {
      showAlert({
        title: 'Error',
        message: 'Please enter a valid number of months',
        type: 'error',
      });
      return;
    }

    const goalData: Omit<Goal, 'id' | 'createdAt' | 'currentAmount'> = {
      title: title.trim(),
      targetAmount: parseFloat(targetAmount),
      timeframe: timeframe as 'month' | 'year' | 'custom',
      months: timeframe === 'month' ? parseInt(months) : undefined,
      years: timeframe === 'year' ? parseInt(years) : undefined,
      customMonths: timeframe === 'custom' ? parseInt(customMonths) : undefined,
      reason: reason.trim() || '',
    };

    if (editingGoal) {
      await updateGoal(editingGoal.id, goalData);
      showAlert({
        title: 'Updated',
        message: 'Goal updated successfully!',
        type: 'success',
        autoDismiss: 2000,
      });
    } else {
      await addGoal(goalData);
      showAlert({
        title: 'Added',
        message: 'Goal added successfully!',
        type: 'success',
        autoDismiss: 2000,
      });
    }

    resetForm();
    ReactNativeHapticFeedback.trigger('notificationSuccess', { enableVibrateFallback: true });
  };

  const handleEdit = (goal: Goal) => {
    setTitle(goal.title);
    setTargetAmount(goal.targetAmount.toString());
    setTimeframe(goal.timeframe);
    setMonths(goal.months?.toString() || '');
    setYears(goal.years?.toString() || '');
    setCustomMonths(goal.customMonths?.toString() || '');
    setReason(goal.reason);
    setEditingGoal(goal);
    setIsAdding(true);
  };

  const handleDelete = (goal: Goal) => {
    showAlert({
      title: 'Delete Goal',
      message: `Are you sure you want to delete "${goal.title}"?`,
      type: 'warning',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteGoal(goal.id);
            ReactNativeHapticFeedback.trigger('impactLight', { enableVibrateFallback: true });
          },
        },
      ],
    });
  };

  const bottomPadding = insets.bottom + 50;

  const dynamicStyles = useMemo(() => ({
    container: { backgroundColor: theme.colors.background },
    card: { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight },
    text: { color: theme.colors.text },
    textSecondary: { color: theme.colors.textSecondary },
    addButton: { backgroundColor: theme.colors.primary },
  }), [theme]);

  return (
    <PageLayout title="Goals" navigation={navigation} showBack={true}>
      <ScrollView
        style={[styles.container, dynamicStyles.container]}
        contentContainerStyle={{ paddingBottom: bottomPadding }}
        showsVerticalScrollIndicator={false}
      >
        {!isAdding ? (
          <>
            {goalsWithProgress.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, dynamicStyles.textSecondary]}>
                  Create your first goal to start tracking your savings!
                </Text>
              </View>
            ) : (
              goalsWithProgress.map((goal) => (
                <View key={goal.id} style={[styles.goalCard, dynamicStyles.card]}>
                  <View style={styles.goalHeader}>
                    <View style={styles.goalHeaderLeft}>
                      <Text style={[styles.goalTitle, dynamicStyles.text]}>{goal.title}</Text>
                      {goal.reason && (
                        <Text style={[styles.goalReason, dynamicStyles.textSecondary]}>
                          {goal.reason}
                        </Text>
                      )}
                    </View>
                    <View style={styles.goalActions}>
                      <TouchableOpacity
                        onPress={() => handleEdit(goal)}
                        style={styles.actionButton}
                        activeOpacity={0.7}
                      >
                        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <Path
                            d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                            fill={theme.colors.primary}
                          />
                        </Svg>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDelete(goal)}
                        style={styles.actionButton}
                        activeOpacity={0.7}
                      >
                        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <Path
                            d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                            fill={theme.colors.error}
                          />
                        </Svg>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.goalProgress}>
                    <View style={styles.goalProgressInfo}>
                      <Text style={[styles.goalAmount, dynamicStyles.text]}>
                        {selectedCurrency.symbol}{goal.currentAmount.toFixed(2)} / {selectedCurrency.symbol}{goal.targetAmount.toFixed(2)}
                      </Text>
                      <Text style={[styles.goalPercentage, dynamicStyles.textSecondary]}>
                        {Math.round(goal.progress * 100)}%
                      </Text>
                    </View>
                    <View style={[styles.progressBarContainer, { backgroundColor: theme.colors.surface }]}>
                      <View
                        style={[
                          styles.progressBar,
                          {
                            width: `${Math.min(100, goal.progress * 100)}%`,
                            backgroundColor: theme.colors.success,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  <View style={styles.goalMeta}>
                    <Text style={[styles.goalMetaText, dynamicStyles.textSecondary]}>
                      {goal.timeframe === 'month' && goal.months 
                        ? `${goal.months} ${goal.months === 1 ? 'month' : 'months'}`
                        : goal.timeframe === 'year' && goal.years
                        ? `${goal.years} ${goal.years === 1 ? 'year' : 'years'}`
                        : goal.timeframe === 'custom' && goal.customMonths
                        ? `${goal.customMonths} months`
                        : 'N/A'}
                    </Text>
                    <Text style={[styles.goalMetaText, dynamicStyles.textSecondary]}>
                      {selectedCurrency.symbol}{goal.monthlyContribution.toFixed(2)}/month
                    </Text>
                  </View>
                </View>
              ))
            )}

            <TouchableOpacity
              style={[styles.addButton, dynamicStyles.addButton]}
              onPress={() => {
                resetForm();
                setIsAdding(true);
                ReactNativeHapticFeedback.trigger('impactLight', { enableVibrateFallback: true });
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.addButtonText}>+ Add Goal</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.formContainer}>
            <Text style={[styles.formTitle, dynamicStyles.text]}>
              {editingGoal ? 'Edit Goal' : 'New Goal'}
            </Text>

            <InputField
              label="Goal Title (max a few words)"
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., Big house"
              maxLength={20}
            />

            <View style={styles.amountContainer}>
              <Text style={[styles.label, dynamicStyles.textSecondary]}>Target Amount</Text>
              <TouchableOpacity
                style={[styles.amountInput, { borderColor: theme.colors.border, backgroundColor: theme.colors.inputBackground }]}
                onPress={() => {
                  setShowCalculator(true);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.amountText, dynamicStyles.text]}>
                  {targetAmount ? `${selectedCurrency.symbol}${targetAmount}` : `${selectedCurrency.symbol}0.00`}
                </Text>
              </TouchableOpacity>
            </View>

            <SelectField
              label="Timeframe"
              selectedValue={timeframe ? timeframe.charAt(0).toUpperCase() + timeframe.slice(1) : ''}
              options={['Month', 'Year', 'Custom']}
              onChange={(value) => {
                const lowerValue = value.toLowerCase() as 'month' | 'year' | 'custom';
                setTimeframe(lowerValue);
                if (lowerValue !== 'month') setMonths('');
                if (lowerValue !== 'year') setYears('');
                if (lowerValue !== 'custom') setCustomMonths('');
              }}
            />

            {timeframe === 'month' && (
              <View key="month-selector" style={{ zIndex: 100 }}>
                <SelectField
                  label="How many months?"
                  selectedValue={months || ''}
                  options={Array.from({ length: 12 }, (_, i) => (i + 1).toString())}
                  onChange={(value) => {
                    setMonths(value);
                    ReactNativeHapticFeedback.trigger('impactLight', { enableVibrateFallback: true });
                  }}
                />
              </View>
            )}

            {timeframe === 'year' && (
              <View key="year-selector" style={{ zIndex: 100 }}>
                <SelectField
                  label="How many years?"
                  selectedValue={years || ''}
                  options={Array.from({ length: 5 }, (_, i) => (i + 1).toString())}
                  onChange={(value) => {
                    setYears(value);
                    ReactNativeHapticFeedback.trigger('impactLight', { enableVibrateFallback: true });
                  }}
                />
              </View>
            )}

            {timeframe === 'custom' && (
              <View style={styles.amountContainer}>
                <Text style={[styles.label, dynamicStyles.textSecondary]}>Number of Months</Text>
                <TextInput
                  style={[
                    styles.amountInput,
                    { borderColor: theme.colors.border, backgroundColor: theme.colors.inputBackground, color: theme.colors.text },
                  ]}
                  value={customMonths}
                  onChangeText={setCustomMonths}
                  placeholder="Enter months"
                  placeholderTextColor={theme.colors.placeholder}
                  keyboardType="numeric"
                />
              </View>
            )}

            <InputField
              label="Reason (optional)"
              value={reason}
              onChangeText={setReason}
              placeholder="Why are you saving for this?"
              multiline
              numberOfLines={3}
            />

            <View style={styles.formButtons}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: theme.colors.surface }]}
                onPress={resetForm}
                activeOpacity={0.7}
              >
                <Text style={[styles.cancelButtonText, dynamicStyles.text]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, dynamicStyles.addButton]}
                onPress={handleAdd}
                activeOpacity={0.7}
              >
                <Text style={styles.saveButtonText}>
                  {editingGoal ? 'Update' : 'Add'} Goal
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <CalculatorKeyboard
          visible={showCalculator}
          initialValue={targetAmount}
          onResult={(val) => {
            setTargetAmount(val);
            setShowCalculator(false);
          }}
          onClose={() => {
            setShowCalculator(false);
          }}
        />
      </ScrollView>
    </PageLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Space Grotesk',
  },
  goalCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  goalHeaderLeft: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Space Grotesk',
    marginBottom: 4,
  },
  goalReason: {
    fontSize: 14,
    fontFamily: 'Space Grotesk',
    marginTop: 4,
  },
  goalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  goalProgress: {
    marginBottom: 12,
  },
  goalProgressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalAmount: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Space Grotesk',
  },
  goalPercentage: {
    fontSize: 14,
    fontFamily: 'Space Grotesk',
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  goalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  goalMetaText: {
    fontSize: 12,
    fontFamily: 'Space Grotesk',
  },
  addButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Space Grotesk',
  },
  formContainer: {
    padding: 4,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Space Grotesk',
    marginBottom: 24,
  },
  amountContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontFamily: 'Space Grotesk',
    fontWeight: '500',
  },
  amountInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    minHeight: 50,
    justifyContent: 'center',
  },
  amountText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Space Grotesk',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Space Grotesk',
  },
  saveButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Space Grotesk',
  },
});
