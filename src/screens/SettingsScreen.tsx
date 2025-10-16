import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import PageLayout from '@components/PageLayout';

export default function SettingsScreen({ navigation }: any) {
  return (
    <PageLayout title="Settings" navigation={navigation}>
      <View style={styles.container}>
        <Text>Settings</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('SettingsSubPage')}
        >
          <Text style={styles.buttonText}>Open Sub Page</Text>
        </TouchableOpacity>
      </View>
    </PageLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  button: {
    marginTop: 20,
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 10,
  },
  buttonText: { color: '#fff' },
});
