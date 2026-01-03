import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
} from "react-native";
import DatePicker from "react-native-date-picker";
import * as ImagePicker from "react-native-image-picker";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { useTransactions, Transaction } from "@context/TransactionsContext";
import { CommonActions } from "@react-navigation/native";
import { InputField } from "@components/ui/InputField";
import { SelectField } from "@components/ui/SelectField";
import { CalculatorKeyboard } from "@components/ui/CalculatorKeyboard";
import { useAlert } from "@context/AlertContext";
import { useCategories } from "@context/CategoriesContext";
import { useAccounts } from "@context/AccountsContext";
import { Svg, Path } from "react-native-svg";
import { useTheme } from "@context/ThemeContext";
import { logger } from "@utils/logger";

import type { AppNavigation } from '@app-types/navigation';

interface EditTransactionProps {
  transaction: Transaction;
  onClose: () => void;
  navigation: AppNavigation;
}

export const EditTransaction: React.FC<EditTransactionProps> = React.memo(({ transaction, onClose, navigation }) => {
  const { updateTransaction } = useTransactions();
  const { showAlert } = useAlert();
  const { theme } = useTheme();

  const [type, setType] = useState<"Income" | "Expense">(transaction.type);
  const [date, setDate] = useState(new Date(transaction.date));
  const [amount, setAmount] = useState(String(transaction.amount));
  
  const { getCategoriesByType } = useCategories();
  const availableCategories = useMemo(() => getCategoriesByType(type), [type, getCategoriesByType]);
  const [category, setCategory] = useState(transaction.category);

  useEffect(() => {
    if (availableCategories.length > 0) {
      if (!availableCategories.includes(category)) {
        setCategory(availableCategories[0]);
      }
    }
  }, [type, availableCategories, category]);

  const { accounts } = useAccounts();
  const [account, setAccount] = useState(transaction.account);

  const [note, setNote] = useState(transaction.note || "");
  const [imageUri, setImageUri] = useState<string | null>(transaction.imageUri || null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const triggerHaptic = useCallback((type: "light" | "success") => {
    ReactNativeHapticFeedback.trigger(
      type === "light" ? "impactLight" : "notificationSuccess",
      { enableVibrateFallback: true }
    );
  }, []);

  const handlePickImage = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibrary({ mediaType: "photo" });
      if (result.assets?.length && result.assets[0].uri) {
        setImageUri(result.assets[0].uri);
        triggerHaptic("light");
      }
    } catch (error) {
      logger.error("Error picking image", error);
      showAlert({
        title: "Error",
        message: "Failed to pick image. Please try again.",
        type: "error",
      });
    }
  }, [triggerHaptic]);

  const handleUpdateTransaction = useCallback(() => {
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      showAlert({
        title: "Invalid Amount",
        message: "Please enter a valid positive amount.",
        type: "error",
      });
      return;
    }

    if (!category || !account) {
      showAlert({
        title: "Missing Field",
        message: "Please select a category and account.",
        type: "error",
      });
      return;
    }

    updateTransaction(transaction.id, {
      type,
      date: date.toISOString(),
      amount: amountNum,
      category,
      account,
      note: note.trim() || undefined,
      imageUri: imageUri || null,
    });

    triggerHaptic("success");
    showAlert({
      title: "Updated",
      message: "Transaction updated successfully!",
      type: "success",
      buttons: [
        {
          text: "OK",
          onPress: () => {
            onClose();
          },
        },
      ],
      autoDismiss: 2000,
    });
  }, [amount, category, account, type, date, note, imageUri, transaction.id, updateTransaction, showAlert, triggerHaptic, onClose]);

  const headerTabsStyle = useMemo(() => ({
    backgroundColor: theme.colors.surface,
  }), [theme]);

  const tabActiveStyle = useMemo(() => ({
    shadowColor: theme.colors.shadow,
  }), [theme]);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {/* Top Tabs */}
      <View style={[styles.headerTabs, headerTabsStyle]}>
        <TouchableOpacity
          style={[
            styles.tab,
            type === "Expense" && [styles.tabActive, tabActiveStyle],
            type === "Expense" && { borderWidth: 2, borderColor: theme.colors.error, backgroundColor: theme.colors.error },
          ]}
          onPress={() => {
            setType("Expense");
            triggerHaptic("light");
          }}
        >
          <View style={[styles.tabContent, type === "Expense" && styles.tabContentActive]}>
            <Svg width="20" height="20" viewBox="0 0 16 16" fill="none">
              <Path
                d="M13.31536875 2.57909375C12.405475 1.0193875 11.160125 0.16 9.80923125 0.16H6.19076875c-1.35089375 0 -2.59624375 0.85938125 -3.5061375 2.41909375C1.83429375 4.036275 1.36615625 5.9646125 1.36615625 8s0.4681375 3.963725 1.318475 5.42090625C3.594525 14.9806125 4.839875 15.84 6.19076875 15.84h3.6184625c1.35089375 0 2.59624375 -0.8593875 3.5061375 -2.41909375 0.8503375 -1.45718125 1.318475 -3.38551875 1.318475 -5.42090625s-0.4681375 -3.963725 -1.318475 -5.42090625Zm0.09649375 4.81783125h-2.41230625c-0.04711875 -1.23754375 -0.29351875 -2.4593875 -0.729725 -3.6184625h2.3060125c0.46135625 1.00864375 0.7659125 2.2615375 0.83601875 3.6184625ZM11.8589375 2.57230625h-2.1658c-0.2519 -0.4369875 -0.5556375 -0.84196875 -0.9046125 -1.20615h1.02070625c0.75384375 0 1.4624625 0.45230625 2.04970625 1.20615ZM2.57230625 8c0 -3.59584375 1.6584625 -6.63384375 3.6184625 -6.63384375S9.80923125 4.40415625 9.80923125 8s-1.6584625 6.63384375 -3.6184625 6.63384375S2.57230625 11.59584375 2.57230625 8Zm7.236925 6.63384375h-1.01844375c0.348975 -0.36418125 0.6527125 -0.7691625 0.9046125 -1.20615h2.1658c-0.58950625 0.75384375 -1.298125 1.20615 -2.05196875 1.20615Zm2.7666125 -2.41230625h-2.30525625c0.4362 -1.159075 0.68260625 -2.38091875 0.72971875 -3.6184625h2.4123125c-0.0708625 1.356925 -0.37541875 2.60981875 -0.836775 3.6184625Z"
                fill={type === "Expense" ? "#fff" : theme.colors.error}
              />
            </Svg>
            <Text style={[styles.tabText, type === "Expense" ? styles.tabTextActive : { color: theme.colors.textSecondary }]}>Expense</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            type === "Income" && [styles.tabActive, tabActiveStyle],
            type === "Income" && { borderWidth: 2, borderColor: theme.colors.success, backgroundColor: theme.colors.success },
          ]}
          onPress={() => {
            setType("Income");
            triggerHaptic("light");
          }}
        >
          <View style={[styles.tabContent, type === "Income" && styles.tabContentActive]}>
            <Svg width="20" height="20" viewBox="0 0 16 16" fill="none">
              <Path
                d="M12.29935 7.24129375c0 0.58405 -0.6322625 0.9490875 -1.13806875 0.65705625 -0.50580625 -0.292025 -0.50580625 -1.02209375 0 -1.31411875 0.11533125 -0.0665875 0.2461875 -0.10164375 0.37935625 -0.10165 0.419025 0 0.7587125 0.3396875 0.7587125 0.7587125Zm-2.52903125 -3.28774375h-2.52903125c-0.38936875 0 -0.632725 0.42150625 -0.43804375 0.7587125 0.09035625 0.15649375 0.2573375 0.2529 0.43804375 0.2529h2.52903125c0.38936875 0 0.632725 -0.42150625 0.4380375 -0.75870625 -0.09035 -0.1565 -0.25733125 -0.25290625 -0.4380375 -0.25290625Zm6.06966875 3.0348375v2.023225c0 0.838075 -0.67934375 1.51745625 -1.5174125 1.51741875h-0.1492125l-1.02489375 2.86918125c-0.143775 0.4027 -0.5252125 0.67150625 -0.9528125 0.6714625h-0.80423125c-0.42759375 0.00004375 -0.80903125 -0.2687625 -0.9528125 -0.67145625l-0.12139375 -0.34015625h-3.6228375l-0.12139375 0.34015625c-0.143775 0.40269375 -0.5252125 0.6715 -0.9528125 0.67145625H4.81594375c-0.42759375 0.00004375 -0.80903125 -0.2687625 -0.9528125 -0.67145625l-0.79474375 -2.22301875c-0.75606875 -0.8557 -1.22948125 -1.92398125 -1.3555625 -3.0588625 -0.3326875 0.1747375 -0.54109375 0.51949375 -0.5412125 0.895275 0 0.38936875 -0.42150625 0.632725 -0.7587125 0.43804375 -0.15649375 -0.09035625 -0.2529 -0.2573375 -0.2529 -0.43804375 0.0015875 -0.9281 0.63443125 -1.73609375 1.535125 -1.96 0.23429375 -2.890275 2.64640625 -5.1176 5.5461625 -5.1212875h6.57548125c0.38936875 0 0.632725 0.42150625 0.4380375 0.7587125 -0.09035625 0.15649375 -0.25733125 0.2529 -0.4380375 0.2529h-1.3524c0.8394125 0.58894375 1.4995875 1.398575 1.90751875 2.33935625 0.0271875 0.063225 0.05374375 0.12645 0.07903125 0.189675 0.78755625 0.06685 1.39190625 0.7270375 1.38906875 1.51741875Zm-1.0116125 0c0 -0.27935 -0.22645625 -0.50580625 -0.50580625 -0.50580625h-0.23140625c-0.2210875 0.0002375 -0.4167125 -0.14315625 -0.48304375 -0.3540625 -0.5947875 -1.8980875 -2.3545125 -3.1890625 -4.34360625 -3.18658125h-2.023225c-3.50433125 -0.00021875 -5.694725 3.7931875 -3.94275 6.8281375 0.16568125 0.2870125 0.3622125 0.555075 0.58609375 0.79941875 0.0456375 0.04963125 0.08089375 0.1078875 0.1036875 0.17134375l0.827625 2.317225h0.80423125l0.241525 -0.6758875c0.07185 -0.2012375 0.2624125 -0.3356125 0.4760875 -0.335725h4.336025c0.21368125 0.0001125 0.4042375 0.1344875 0.47609375 0.335725l0.24151875 0.6758875h0.80423125l1.14501875 -3.2049125c0.07185 -0.20124375 0.2624125 -0.33561875 0.47609375 -0.33573125h0.50580625c0.2793375 -0.0000125 0.50580625 -0.22646875 0.50580625 -0.50580625Z"
                fill={type === "Income" ? "#fff" : theme.colors.success}
              />
            </Svg>
            <Text style={[styles.tabText, type === "Income" ? styles.tabTextActive : { color: theme.colors.textSecondary }]}>Income</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
      >
        <TouchableOpacity 
          onPress={() => setShowDatePicker(true)} 
          style={[styles.datePicker, { borderColor: theme.colors.border, backgroundColor: theme.colors.inputBackground }]}
        >
          <Text style={[styles.dateLabel, { color: theme.colors.textSecondary }]}>Date</Text>
          <Text style={[styles.dateValue, { color: theme.colors.text }]}>{date.toDateString()}</Text>
        </TouchableOpacity>

        <DatePicker
          modal
          open={showDatePicker}
          date={date}
          mode="date"
          maximumDate={new Date()}
          onConfirm={(selected) => {
            const now = new Date();
            if (selected > now) {
              showAlert({
                title: "Invalid Date",
                message: "You cannot set transaction dates in the future.",
                type: "error",
              });
              return;
            }
            setShowDatePicker(false);
            setDate(selected);
            triggerHaptic("light");
          }}
          onCancel={() => setShowDatePicker(false)}
        />

        {/* Amount */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, color: theme.colors.textSecondary, marginBottom: 6, fontFamily: "Space Grotesk", fontWeight: "500" }}>Amount</Text>
          <TouchableOpacity
            style={[styles.amountInput, { borderColor: theme.colors.border, backgroundColor: theme.colors.inputBackground }]}
            onPress={() => setShowCalculator(true)}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 20, fontWeight: "600", color: theme.colors.text, fontFamily: "Space Grotesk" }}>{amount || "0.00"}</Text>
          </TouchableOpacity>
        </View>

        <SelectField
          label="Category"
          selectedValue={category}
          options={availableCategories}
          onChange={setCategory}
        />
        
        <SelectField
          label="Account"
          selectedValue={account}
          options={accounts}
          onChange={setAccount}
        />

        <InputField label="Note" placeholder="Optional note" value={note} onChangeText={setNote} />

        {/* Image Preview */}
        {imageUri && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, color: theme.colors.textSecondary, marginBottom: 6, fontFamily: "Space Grotesk", fontWeight: "500" }}>Receipt/Image</Text>
            <TouchableOpacity
              onPress={() => setShowImageModal(true)}
              style={[styles.imagePreview, { borderColor: theme.colors.border, backgroundColor: theme.colors.inputBackground }]}
              activeOpacity={0.7}
            >
              <Image source={{ uri: imageUri }} style={styles.imagePreviewImage} resizeMode="cover" />
              <View style={styles.imageOverlay}>
                <Text style={[styles.imageOverlayText, { color: theme.colors.text }]}>Tap to view full size</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Full Screen Image Modal */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.fullScreenImageContainer}>
          <TouchableOpacity
            style={styles.fullScreenImageTouchable}
            activeOpacity={1}
            onPress={() => setShowImageModal(false)}
          >
            <Image 
              source={{ uri: imageUri || '' }} 
              style={styles.fullScreenImage} 
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeImageButton}
            onPress={() => setShowImageModal(false)}
          >
            <Text style={styles.closeImageButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <CalculatorKeyboard
        visible={showCalculator}
        initialValue={amount}
        onResult={(val) => setAmount(val)}
        onClose={() => setShowCalculator(false)}
      />

      {/* Bottom */}
      <View style={[styles.footer, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.borderLight }]}>
        <TouchableOpacity 
          style={[styles.imageButton, { backgroundColor: theme.colors.surface }]} 
          onPress={handlePickImage}
        >
          <Text style={[styles.imageButtonText, { color: theme.colors.textSecondary }]}>{imageUri ? "Image Selected" : "Add Image or Receipt"}</Text>
        </TouchableOpacity>

        <View style={styles.footerButtons}>
          <TouchableOpacity 
            style={[styles.closeBtn, { backgroundColor: theme.colors.surface }]} 
            onPress={onClose}
          >
            <Text style={[styles.closeText, { color: theme.colors.text }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.addBtn, { backgroundColor: theme.colors.primary }]} 
            onPress={handleUpdateTransaction}
          >
            <Text style={styles.addText}>Update</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  headerTabs: {
    flexDirection: "row",
    alignSelf: "center",
    borderRadius: 14,
    overflow: "hidden",
    padding: 4,
    marginVertical: 15,
    gap: 4,
  },
  tab: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  tabActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  tabContentActive: {
  },
  tabText: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Space Grotesk",
  },
  tabTextActive: {
    color: "#fff",
  },
  scrollContent: { paddingHorizontal: 10, paddingBottom: 0 },
  datePicker: { 
    marginBottom: 16,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  dateLabel: { 
    fontSize: 14, 
    marginBottom: 6,
    fontFamily: "Space Grotesk",
    fontWeight: "500",
  },
  dateValue: {
    fontSize: 16,
    fontFamily: "Space Grotesk",
  },
  amountBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingBottom: 12,
  },
  imageButton: {
    alignItems: "center",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  imageButtonText: { 
    fontWeight: "500",
    fontFamily: "Space Grotesk",
  },
  footerButtons: { flexDirection: "row", gap: 10 },
  amountInput: { 
    padding: 12, 
    borderRadius: 10, 
    borderWidth: 1,
    fontFamily: "Space Grotesk",
  },
  closeBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  addBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  closeText: { 
    fontWeight: "600",
    fontFamily: "Space Grotesk",
  },
  addText: { 
    fontWeight: "600", 
    color: "#fff",
    fontFamily: "Space Grotesk",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  imagePreviewImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 8,
    alignItems: "center",
  },
  imageOverlayText: {
    fontSize: 12,
    fontFamily: "Space Grotesk",
    color: "#fff",
  },
  fullScreenImageContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
  },
  fullScreenImageTouchable: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  closeImageButton: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeImageButtonText: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
  },
});

