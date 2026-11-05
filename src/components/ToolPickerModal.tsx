import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

export type ToolPath = '/timer' | '/stopwatch' | '/world-clock';

interface ToolPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (path: ToolPath) => void;
}

const TOOLS: { title: string; description: string; path: ToolPath }[] = [
  { title: 'TIMER', description: 'Count down to a moment', path: '/timer' },
  { title: 'STOPWATCH', description: 'Track elapsed time and laps', path: '/stopwatch' },
  { title: 'WORLD CLOCK', description: 'Keep an eye on other time zones', path: '/world-clock' },
];

export function ToolPickerModal({ visible, onClose, onSelect }: ToolPickerModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.panel}>
          <View style={styles.headingRow}>
            <Text style={styles.heading}>CLOCK TOOLS</Text>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close tools">
              <Text style={styles.close}>CLOSE</Text>
            </Pressable>
          </View>
          {TOOLS.map((tool) => (
            <Pressable
              key={tool.path}
              onPress={() => onSelect(tool.path)}
              accessibilityRole="button"
              style={({ pressed }) => [styles.tool, pressed && styles.pressed]}
            >
              <View>
                <Text style={styles.toolTitle}>{tool.title}</Text>
                <Text style={styles.description}>{tool.description}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.78)', padding: 20 },
  panel: { width: '100%', maxWidth: 520, padding: 22, borderWidth: 1, borderColor: 'rgba(230,230,0,0.5)', backgroundColor: '#090909' },
  headingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  heading: { color: '#E6E600', fontSize: 13, fontWeight: '700', letterSpacing: 2 },
  close: { color: 'rgba(255,255,255,0.65)', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  tool: { minHeight: 66, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  pressed: { opacity: 0.55 },
  toolTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', letterSpacing: 1.5 },
  description: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 5 },
  arrow: { color: '#E6E600', fontSize: 27 },
});
