import React, { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';

interface ClockToolLayoutProps {
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  actions?: ReactNode;
  onInteract?: () => void;
  renderFace: (state: { fontSize: number; controlsVisible: boolean }) => ReactNode;
  children?: ReactNode;
}

export function ClockToolLayout({ title, subtitle, footer, actions, onInteract, renderFace, children }: ClockToolLayoutProps) {
  const { width, height } = useWindowDimensions();
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const revealControls = useCallback(() => {
    setControlsVisible(true);
    onInteract?.();
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setControlsVisible(false), 3500);
  }, [onInteract]);

  useEffect(() => {
    hideTimerRef.current = setTimeout(() => setControlsVisible(false), 3500);
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const leaveTool = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const fontSize = Math.max(20, Math.min(width / 6, height * 0.36));

  return (
    <View
      style={styles.screen}
      onTouchStart={revealControls}
      // @ts-expect-error onMouseMove is supported by React Native Web
      onMouseMove={Platform.OS === 'web' ? revealControls : undefined}
    >
      <View pointerEvents="box-none" style={[styles.topBar, !controlsVisible && styles.hidden]}>
        <Pressable onPress={leaveTool} accessibilityRole="button" accessibilityLabel="Return to system clock" style={styles.chip}>
          <Text style={styles.chipText}>‹ CLOCK</Text>
        </Pressable>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <View style={styles.actions}>{actions}</View>
      </View>
      <View style={styles.face}>
        {renderFace({ fontSize, controlsVisible })}
      </View>
      {footer ? <View pointerEvents="none" style={styles.footer}>{footer}</View> : null}
      {children}
    </View>
  );
}

export const toolColors = {
  accent: '#E6E600',
  muted: 'rgba(255,255,255,0.58)',
  line: 'rgba(255,255,255,0.22)',
  panel: 'rgba(255,255,255,0.04)',
};

export const toolStyles = StyleSheet.create({
  time: { color: toolColors.accent, fontFamily: 'DSEG7Classic-BoldItalic', textAlign: 'center', includeFontPadding: false, letterSpacing: 1, textShadowColor: toolColors.accent, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 16 },
  buttonRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 24, flexWrap: 'wrap' },
  button: { minWidth: 116, minHeight: 46, borderWidth: 1, borderColor: toolColors.accent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  buttonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700', letterSpacing: 1.4 },
  secondaryButton: { borderColor: toolColors.line },
  label: { color: toolColors.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.3 },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000000', paddingHorizontal: 16 },
  topBar: { position: 'absolute', top: Platform.OS === 'web' ? 18 : 36, left: 18, right: 18, zIndex: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 44 },
  hidden: { opacity: 0 },
  chip: { minWidth: 92, minHeight: 40, justifyContent: 'center', paddingHorizontal: 12, borderWidth: 1, borderColor: toolColors.line, backgroundColor: 'rgba(0,0,0,0.35)' },
  chipText: { color: toolColors.accent, fontSize: 10, fontWeight: '700', letterSpacing: 1.2 },
  titleBlock: { alignItems: 'center', position: 'absolute', left: '25%', right: '25%', pointerEvents: 'none' },
  title: { color: 'rgba(255,255,255,0.72)', fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  subtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 8, letterSpacing: 1.2, marginTop: 4 },
  actions: { minWidth: 92, alignItems: 'flex-end' },
  face: { flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' },
  footer: { position: 'absolute', left: 16, right: 16, bottom: '7%', alignItems: 'center', justifyContent: 'center' },
});
