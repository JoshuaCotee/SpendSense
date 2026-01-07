import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { useTheme } from '@context/ThemeContext';
import { formatMonthYear } from '@utils/dateUtils';
import { MonthYearPicker } from '@components/ui/MonthYearPicker';

interface AnalyticsSelectorProps {
  viewMode: 'month' | 'year' | 'alltime';
  setViewMode: (mode: 'month' | 'year' | 'alltime') => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  showMonthYearPicker: boolean;
  setShowMonthYearPicker: (show: boolean) => void;
  changeMonth: (direction: "prev" | "next") => void;
}

export const AnalyticsSelector: React.FC<AnalyticsSelectorProps> = ({
  viewMode,
  setViewMode,
  selectedDate,
  setSelectedDate,
  showMonthYearPicker,
  setShowMonthYearPicker,
  changeMonth,
}) => {
  const { theme } = useTheme();

  const dynamicStyles = {
    modeToggle: { backgroundColor: theme.colors.surface },
    modeButtonActive: { backgroundColor: theme.colors.primary },
    modeText: { color: theme.colors.textSecondary },
    modeTextActive: { color: '#fff' },
    monthSelector: { borderTopColor: theme.colors.borderLight, borderBottomColor: theme.colors.borderLight },
    monthText: { color: theme.colors.text },
  };

  return (
    <>
      <View style={styles.selectorContainer}>
        <View style={[styles.modeToggle, dynamicStyles.modeToggle]}>
          <TouchableOpacity
            style={[styles.modeButton, viewMode === 'month' && [styles.modeButtonActive, dynamicStyles.modeButtonActive]]}
            onPress={() => setViewMode('month')}
            activeOpacity={0.7}
          >
            <Text style={[styles.modeText, dynamicStyles.modeText, viewMode === 'month' && dynamicStyles.modeTextActive]}>
              Month
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, viewMode === 'year' && [styles.modeButtonActive, dynamicStyles.modeButtonActive]]}
            onPress={() => setViewMode('year')}
            activeOpacity={0.7}
          >
            <Text style={[styles.modeText, dynamicStyles.modeText, viewMode === 'year' && dynamicStyles.modeTextActive]}>
              Year
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, viewMode === 'alltime' && [styles.modeButtonActive, dynamicStyles.modeButtonActive]]}
            onPress={() => setViewMode('alltime')}
            activeOpacity={0.7}
          >
            <Text style={[styles.modeText, dynamicStyles.modeText, viewMode === 'alltime' && dynamicStyles.modeTextActive]}>
              All Time
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.monthSelectorContainer}>
        {viewMode !== 'alltime' && (
          <View style={[styles.monthSelector, dynamicStyles.monthSelector]}>
            <TouchableOpacity
              style={styles.arrowButton}
              onPress={() => changeMonth("prev")}
              activeOpacity={0.7}
            >
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M15 18L9 12L15 6"
                  stroke={theme.colors.primary}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowMonthYearPicker(true)}
              activeOpacity={0.7}
              style={styles.monthTextButton}
            >
              <Text style={[styles.monthText, dynamicStyles.monthText]}>
                {viewMode === 'month' 
                  ? formatMonthYear(selectedDate)
                  : selectedDate.getFullYear().toString()}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.arrowButton}
              onPress={() => changeMonth("next")}
              activeOpacity={0.7}
            >
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M9 18L15 12L9 6"
                  stroke={theme.colors.primary}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <MonthYearPicker
        visible={showMonthYearPicker}
        currentDate={selectedDate}
        onSelect={setSelectedDate}
        onClose={() => setShowMonthYearPicker(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  selectorContainer: {
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  monthSelectorContainer: {
    marginBottom: 20,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 4,
    marginBottom: 15,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#901ddc',
  },
  modeText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Space Grotesk',
    color: '#666',
  },
  modeTextActive: {
    color: '#fff',
  },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  arrowButton: {
    width: 35,
    height: 35,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  monthTextButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  monthText: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Space Grotesk",
    color: "#111",
  },
});

