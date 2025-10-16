import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PageLayout from '@components/PageLayout';

export default function SettingsSubPage({ navigation }: any) {
  return (
    <PageLayout title="Settings Detail" showBack={true} navigation={navigation}>
      <View style={styles.container}>
        <Text>This is a sub-page under Settings</Text>
      </View>
    </PageLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
