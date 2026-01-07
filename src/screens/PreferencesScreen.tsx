import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PageLayout from '@components/PageLayout';
import { PreferencesSettingsSection } from '@components/settings/PreferencesSettingsSection';

export default function PreferencesScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom + 30;

  return (
    <PageLayout title="Preferences" showBack={true} navigation={navigation}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={{ paddingBottom: bottomPadding, padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <PreferencesSettingsSection />
      </ScrollView>
    </PageLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

