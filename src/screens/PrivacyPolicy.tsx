import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PageLayout from '@components/PageLayout';
import { useTheme } from '@context/ThemeContext';

export default function PrivacyPolicy({ navigation }: any) {
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
    <PageLayout title="Privacy Policy" showBack={true} navigation={navigation}>
      <ScrollView 
        style={[styles.container, dynamicStyles.container]} 
        contentContainerStyle={[styles.scrollContent, { paddingTop: 10, paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.lastUpdated, dynamicStyles.lastUpdated]}>Last Updated: {new Date().toLocaleDateString()}</Text>
        
        <View style={styles.section}>
          <Text style={[styles.heading, dynamicStyles.heading]}>1. Introduction</Text>
          <Text style={[styles.text, dynamicStyles.text]}>
            SpendSense ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, dynamicStyles.heading]}>2. Information We Collect</Text>
          <Text style={[styles.text, dynamicStyles.text]}>
            We collect information that you provide directly to us, including:
          </Text>
          <Text style={[styles.bulletPoint, dynamicStyles.bulletPoint]}>• Transaction data (amounts, categories, dates, notes)</Text>
          <Text style={[styles.bulletPoint, dynamicStyles.bulletPoint]}>• Account information (account names and types)</Text>
          <Text style={[styles.bulletPoint, dynamicStyles.bulletPoint]}>• Category preferences</Text>
          <Text style={[styles.bulletPoint, dynamicStyles.bulletPoint]}>• Currency preferences</Text>
          <Text style={[styles.bulletPoint, dynamicStyles.bulletPoint]}>• Images attached to transactions (if provided)</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, dynamicStyles.heading]}>3. How We Use Your Information</Text>
          <Text style={[styles.text, dynamicStyles.text]}>
            We use the information we collect to:
          </Text>
          <Text style={[styles.bulletPoint, dynamicStyles.bulletPoint]}>• Provide, maintain, and improve our services</Text>
          <Text style={[styles.bulletPoint, dynamicStyles.bulletPoint]}>• Process and store your financial transactions</Text>
          <Text style={[styles.bulletPoint, dynamicStyles.bulletPoint]}>• Personalize your experience within the app</Text>
          <Text style={[styles.bulletPoint, dynamicStyles.bulletPoint]}>• Generate financial reports and statistics</Text>
          <Text style={[styles.bulletPoint, dynamicStyles.bulletPoint]}>• Respond to your requests and provide customer support</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, dynamicStyles.heading]}>4. Data Storage and Security</Text>
          <Text style={[styles.text, dynamicStyles.text]}>
            All your financial data is stored locally on your device using encrypted storage. We use industry-standard encryption methods to protect your sensitive information. Your data never leaves your device unless you explicitly choose to back it up or export it.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, dynamicStyles.heading]}>5. Data Sharing</Text>
          <Text style={[styles.text, dynamicStyles.text]}>
            We do not sell, trade, or rent your personal information to third parties. Your financial data remains private and is only accessible to you through the app on your device.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, dynamicStyles.heading]}>6. Your Rights</Text>
          <Text style={[styles.text, dynamicStyles.text]}>
            You have the right to:
          </Text>
          <Text style={[styles.bulletPoint, dynamicStyles.bulletPoint]}>• Access your personal data stored in the app</Text>
          <Text style={[styles.bulletPoint, dynamicStyles.bulletPoint]}>• Modify or delete your data at any time</Text>
          <Text style={[styles.bulletPoint, dynamicStyles.bulletPoint]}>• Export your data</Text>
          <Text style={[styles.bulletPoint, dynamicStyles.bulletPoint]}>• Delete your account and all associated data</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, dynamicStyles.heading]}>7. Children's Privacy</Text>
          <Text style={[styles.text, dynamicStyles.text]}>
            Our app is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, dynamicStyles.heading]}>8. Changes to This Privacy Policy</Text>
          <Text style={[styles.text, dynamicStyles.text]}>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, dynamicStyles.heading]}>9. Contact Us</Text>
          <Text style={[styles.text, dynamicStyles.text]}>
            If you have any questions about this Privacy Policy, please contact us through the app's support channels.
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

