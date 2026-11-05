import React, { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

interface ClockToolLayoutProps extends PropsWithChildren {
  title: string;
  subtitle?: string;
}

export function ClockToolLayout({ title, subtitle, children }: ClockToolLayoutProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.replace('/')} accessibilityRole="button" style={styles.back}>
          <Text style={styles.backText}>‹ CLOCK</Text>
        </Pressable>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <View style={styles.spacer} />
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

export const toolColors = {
  accent: '#E6E600',
  muted: 'rgba(255,255,255,0.58)',
  line: 'rgba(255,255,255,0.18)',
  panel: 'rgba(255,255,255,0.04)',
};

export const toolStyles = StyleSheet.create({
  time: { color: toolColors.accent, fontFamily: 'DSEG7Classic-BoldItalic', fontSize: 58, textAlign: 'center', includeFontPadding: false },
  buttonRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 24, flexWrap: 'wrap' },
  button: { minWidth: 116, minHeight: 46, borderWidth: 1, borderColor: toolColors.accent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  buttonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700', letterSpacing: 1.4 },
  secondaryButton: { borderColor: toolColors.line },
  label: { color: toolColors.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.3 },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000000', paddingHorizontal: 24, paddingTop: 14, paddingBottom: 18 },
  header: { flexDirection: 'row', alignItems: 'center', minHeight: 48 },
  back: { minWidth: 92, minHeight: 40, justifyContent: 'center' },
  backText: { color: toolColors.accent, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  titleBlock: { alignItems: 'center', flex: 1 },
  title: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', letterSpacing: 2.5 },
  subtitle: { color: toolColors.muted, fontSize: 10, marginTop: 4 },
  spacer: { minWidth: 92 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
