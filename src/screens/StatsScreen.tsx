import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PageLayout from '@components/PageLayout';

export default function StatsScreen({ navigation }: any) {
  return (
    <PageLayout title="Stats" navigation={navigation}>
      <View style={styles.container}>
        <Text>Stats Content</Text>
      </View>
    </PageLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});