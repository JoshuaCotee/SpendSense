import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated } from 'react-native';
import { Svg, Path } from 'react-native-svg';

const MIN_YEAR = 1997;

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

interface MonthYearPickerProps {
  visible: boolean;
  currentDate: Date;
  onSelect: (date: Date) => void;
  onClose: () => void;
}

export const MonthYearPicker: React.FC<MonthYearPickerProps> = ({
  visible,
  currentDate,
  onSelect,
  onClose,
}) => {
  const [viewMode, setViewMode] = useState<'months' | 'years'>('months');
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const [yearPageStart, setYearPageStart] = useState(currentYear);

  // always generate a 4x4 grid - oldest to newest (latest at the end)
  const yearGrid = Array.from({ length: 16 }, (_, i) => yearPageStart - i)
  .filter(year => year >= MIN_YEAR && year <= currentYear);

  useEffect(() => {
    if (visible) {
      const year = currentDate.getFullYear();
      setSelectedYear(year);
      setYearPageStart(year);
      setViewMode('months');
  
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [visible]);
  
  const handleMonthSelect = (month: number) => {
    const newDate = new Date(selectedYear, month, 1);
    onSelect(newDate);
    onClose();
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setViewMode('months');
  };

  const handleYearNavigation = (direction: 'prev' | 'next') => {
    setYearPageStart(prev => {
      if (direction === 'prev') {
        const nextStart = prev - 16;
        return Math.max(nextStart, MIN_YEAR);
      } else {
        const nextStart = prev + 16;
        return Math.min(nextStart, currentYear);
      }
    });
  };  

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
          onStartShouldSetResponder={() => true}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
                {viewMode === 'years' && yearPageStart > MIN_YEAR && (
                    <TouchableOpacity
                        onPress={() => handleYearNavigation('prev')}
                        style={styles.navButton}
                        activeOpacity={0.7}
                    >
                        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <Path d="M15 18l-6-6 6-6" stroke="#901ddc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    onPress={() => {
                        if (viewMode === 'months') {
                        setYearPageStart(selectedYear);
                        setViewMode('years');
                        } else {
                        setViewMode('months');
                        }
                    }}
                    style={styles.headerButton}
                    activeOpacity={0.7}
                >
                    <Text style={styles.headerText}>
                    {viewMode === 'months' ? `${selectedYear}` : `${selectedYear}`}
                    </Text>
                    <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <Path
                        d={viewMode === 'months' ? "M7 10l5 5 5-5" : "M7 14l5-5 5 5"}
                        stroke="#901ddc"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    </Svg>
                </TouchableOpacity>

                {viewMode === 'years' && yearPageStart < currentYear && (
                    <TouchableOpacity
                        onPress={() => handleYearNavigation('next')}
                        style={styles.navButton}
                        activeOpacity={0.7}
                    >
                        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <Path d="M9 18l6-6-6-6" stroke="#901ddc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                    </TouchableOpacity>
                )}

            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
              <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="#901ddc"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
          </View>

            {/* Content */}
            {viewMode === 'months' ? (
                <View style={styles.monthsContainer}>
                    <View style={styles.monthsGrid}>
                    {MONTHS.map((month, index) => {
                        const isSelected =
                        selectedYear === currentYear && index === currentMonth;
                        const isCurrentMonth =
                        index === new Date().getMonth() &&
                        selectedYear === new Date().getFullYear();

                        return (
                        <TouchableOpacity
                            key={index}
                            style={[
                            styles.monthItem,
                            isSelected && styles.selectedMonthItem,
                            isCurrentMonth && !isSelected && styles.currentMonthItem,
                            ]}
                            onPress={() => handleMonthSelect(index)}
                            activeOpacity={0.7}
                        >
                            <Text
                            style={[
                                styles.monthText,
                                isSelected && styles.selectedMonthText,
                                isCurrentMonth && !isSelected && styles.currentMonthText,
                            ]}
                            >
                            {month}
                            </Text>
                        </TouchableOpacity>
                        );
                    })}
                    </View>
                </View>
                ) : (
                <View style={styles.yearsContainer}>
                    <View style={styles.yearGrid}>
                    {[...yearGrid]
                        .reduce<number[][]>((rows, year, index) => {
                        const rowIndex = Math.floor(index / 4);
                        if (!rows[rowIndex]) rows[rowIndex] = [];
                        rows[rowIndex].push(year);
                        return rows;
                        }, [])
                        .map(row => row.reverse())
                        .reverse()
                        .flat()
                        .map(year => {
                        const isSelected = year === selectedYear;
                        const isCurrentYear = year === new Date().getFullYear();

                        return (
                            <TouchableOpacity
                            key={year}
                            style={[
                                styles.yearItem,
                                isSelected && styles.selectedYearItem,
                                isCurrentYear && !isSelected && styles.currentYearItem,
                            ]}
                            onPress={() => handleYearSelect(year)}
                            activeOpacity={0.7}
                            >
                            <Text
                                style={[
                                styles.yearText,
                                isSelected && styles.selectedYearText,
                                isCurrentYear && !isSelected && styles.currentYearText,
                                ]}
                            >
                                {year}
                            </Text>
                            </TouchableOpacity>
                        );
                        })}
                    </View>

                </View>
            )}
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '90%',
    maxWidth: 420,
    maxHeight: '75%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fafafa',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Space Grotesk',
    color: '#111',
  },
  navButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
  },
  closeButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
  },
  monthsContainer: {
    padding: 20,
  },
  monthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  monthItem: {
    width: '22%',
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#f8f8f8',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  selectedMonthItem: {
    backgroundColor: '#901ddc',
    borderColor: '#901ddc',
    shadowColor: '#901ddc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  currentMonthItem: {
    borderColor: '#901ddc',
    borderWidth: 2,
    backgroundColor: '#f5f0ff',
  },
  monthText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Space Grotesk',
    color: '#333',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  selectedMonthText: {
    color: '#fff',
    fontWeight: '700',
  },
  currentMonthText: {
    color: '#901ddc',
  },
  yearsContainer: {
    padding: 20,
    maxHeight: 400,
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    width: '100%',
  },
  yearItem: {
    width: '22%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: '#f8f8f8',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  selectedYearItem: {
    backgroundColor: '#901ddc',
    borderColor: '#901ddc',
    shadowColor: '#901ddc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  currentYearItem: {
    borderColor: '#901ddc',
    backgroundColor: '#f5f0ff',
  },
  yearText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Space Grotesk',
    color: '#111',
    textAlign: 'center',
  },
  selectedYearText: {
    color: '#fff',
    fontWeight: '700',
  },
  currentYearText: {
    color: '#901ddc',
    fontWeight: '700',
  },
});
