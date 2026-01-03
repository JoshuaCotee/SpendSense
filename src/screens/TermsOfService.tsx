import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PageLayout from '@components/PageLayout';
import { useTheme } from '@context/ThemeContext';

export default function TermsOfService({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const bottomPadding = insets.bottom + 100; // Bottom nav bar height + safe area

  const dynamicStyles = {
    container: { backgroundColor: theme.colors.background },
    lastUpdated: { color: theme.colors.textSecondary },
    heading: { color: theme.colors.text },
    text: { color: theme.colors.text },
    bulletPoint: { color: theme.colors.text },
  };

  return (
    <PageLayout title="Terms of Service" showBack={true} navigation={navigation}>
      <ScrollView 
        style={[styles.container, dynamicStyles.container]} 
        contentContainerStyle={[styles.scrollContent, { paddingTop: 10, paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.lastUpdated, dynamicStyles.lastUpdated]}>Last Updated: {new Date().toLocaleDateString()}</Text>
        
        <View style={styles.section}>
          <Text style={[styles.heading, dynamicStyles.heading]}>1. Agreement to Terms</Text>
          <Text style={[styles.text, dynamicStyles.text]}>
            By accessing or using MyFinanceApp ("the App"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the App.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, dynamicStyles.heading]}>2. Description of Service</Text>
          <Text style={[styles.text, dynamicStyles.text]}>
            MyFinanceApp is a personal finance management application that allows you to track income, expenses, and manage your financial transactions. The App provides tools for categorizing transactions, managing accounts, and generating financial reports.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, dynamicStyles.heading]}>3. User Responsibilities</Text>
          <Text style={[styles.text, dynamicStyles.text]}>
            You are responsible for:
          </Text>
          <Text style={[styles.bulletPoint, dynamicStyles.bulletPoint]}>• Maintaining the confidentiality of your device and app access</Text>
          <Text style={[styles.bulletPoint, dynamicStyles.bulletPoint]}>• Ensuring the accuracy of all information you enter</Text>
          <Text style={[styles.bulletPoint, dynamicStyles.bulletPoint]}>• Using the App in compliance with all applicable laws and regulations</Text>
          <Text style={[styles.bulletPoint, dynamicStyles.bulletPoint]}>• Not using the App for any illegal or unauthorized purpose</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, dynamicStyles.heading]}>4. Data Ownership</Text>
          <Text style={[styles.text, dynamicStyles.text]}>
            You retain all ownership rights to your financial data. The App stores your data locally on your device. You are solely responsible for backing up your data and protecting your device from unauthorized access.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, dynamicStyles.heading]}>5. Limitation of Liability</Text>
          <Text style={[styles.text, dynamicStyles.text]}>
            The App is provided "as is" without warranties of any kind. We are not responsible for any loss of data, financial loss, or damages resulting from your use of the App. You use the App at your own risk.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, dynamicStyles.heading]}>6. Financial Advice Disclaimer</Text>
          <Text style={[styles.text, dynamicStyles.text]}>
            The App is a tool for tracking and organizing your financial information. It does not provide financial, investment, or tax advice. You should consult with qualified professionals for financial advice tailored to your specific situation.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, dynamicStyles.heading]}>7. Prohibited Uses</Text>
          <Text style={[styles.text, dynamicStyles.text]}>
            You may not:
          </Text>
          <Text style={[styles.bulletPoint, dynamicStyles.bulletPoint]}>• Use the App to violate any laws or regulations</Text>
          <Text style={[styles.bulletPoint, dynamicStyles.bulletPoint]}>• Attempt to reverse engineer or decompile the App</Text>
          <Text style={[styles.bulletPoint, dynamicStyles.bulletPoint]}>• Use the App to transmit viruses or malicious code</Text>
          <Text style={[styles.bulletPoint, dynamicStyles.bulletPoint]}>• Interfere with or disrupt the App's functionality</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, dynamicStyles.heading]}>8. Modifications to Service</Text>
          <Text style={[styles.text, dynamicStyles.text]}>
            We reserve the right to modify, suspend, or discontinue the App at any time without prior notice. We are not liable to you or any third party for any modification, suspension, or discontinuation of the App.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, dynamicStyles.heading]}>9. Termination</Text>
          <Text style={[styles.text, dynamicStyles.text]}>
            We may terminate or suspend your access to the App immediately, without prior notice, for any breach of these Terms. Upon termination, your right to use the App will cease immediately.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, dynamicStyles.heading]}>10. Changes to Terms</Text>
          <Text style={[styles.text, dynamicStyles.text]}>
            We reserve the right to modify these Terms at any time. We will notify you of any changes by updating the "Last Updated" date. Your continued use of the App after such modifications constitutes acceptance of the updated Terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, dynamicStyles.heading]}>11. Governing Law</Text>
          <Text style={[styles.text, dynamicStyles.text]}>
            These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law provisions.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, dynamicStyles.heading]}>12. Contact Information</Text>
          <Text style={[styles.text, dynamicStyles.text]}>
            If you have any questions about these Terms of Service, please contact us through the app's support channels.
          </Text>
        </View>
      </ScrollView>
    </PageLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  lastUpdated: {
    fontSize: 12,
    fontFamily: "Space Grotesk",
    marginBottom: 20,
    fontStyle: "italic",
  },
  section: {
    marginBottom: 24,
  },
  heading: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Space Grotesk",
    marginBottom: 12,
  },
  text: {
    fontSize: 15,
    lineHeight: 24,
    fontFamily: "Space Grotesk",
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 15,
    lineHeight: 24,
    fontFamily: "Space Grotesk",
    marginLeft: 8,
    marginBottom: 4,
  },
});

