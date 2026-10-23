import React, { useState } from "react";
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  COLOR_PRESETS,
  ColorPreset,
  isValidHexColor,
} from "@/constants/colors";

interface StartupConfigModalProps {
  visible: boolean;
  selectedColor: string;
  use24Hour: boolean;
  onSelectColor: (colorHex: string) => void;
  onToggle24Hour: (use24: boolean) => void;
  onStartClock: () => void;
  isInitialStartup: boolean;
}

export function StartupConfigModal({
  visible,
  selectedColor,
  use24Hour,
  onSelectColor,
  onToggle24Hour,
  onStartClock,
  isInitialStartup,
}: StartupConfigModalProps) {
  const [customHex, setCustomHex] = useState(selectedColor);
  const [hexError, setHexError] = useState(false);

  const handlePresetPress = (preset: ColorPreset) => {
    setCustomHex(preset.hex);
    setHexError(false);
    onSelectColor(preset.hex);
  };

  const handleCustomHexChange = (value: string) => {
    const formatted = value.startsWith("#") ? value : `#${value}`;
    setCustomHex(formatted);
    if (isValidHexColor(formatted)) {
      setHexError(false);
      onSelectColor(formatted.toUpperCase());
    } else {
      setHexError(true);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onStartClock}
    >
      <View style={styles.backdrop}>
        <View style={[styles.card, { borderColor: selectedColor }]}>
          {/* Header */}
          <View style={styles.header}>
            <Image
              source={require("../../assets/icon.png")}
              style={styles.logo}
            />
            <View style={styles.headerText}>
              <Text style={styles.title}>
                {isInitialStartup
                  ? "Configure Display Colour"
                  : "Display Settings"}
              </Text>
              <Text style={styles.subtitle}>
                Choose your LED segment colour and clock format before launching
                fullscreen.
              </Text>
            </View>
          </View>

          {/* Live Mini Preview */}
          <View style={styles.previewBox}>
            <Text
              style={[
                styles.previewTime,
                {
                  color: selectedColor,
                  textShadowColor: selectedColor,
                },
              ]}
            >
              01:46:41
            </Text>
            <Text
              style={[
                styles.previewDate,
                {
                  color: selectedColor,
                  textShadowColor: selectedColor,
                },
              ]}
            >
              WED - OCT 21, 2026
            </Text>
          </View>

          <ScrollView
            style={styles.scrollArea}
            showsVerticalScrollIndicator={false}
          >
            {/* Preset Colors */}
            <Text style={styles.sectionLabel}>LED COLOUR PRESETS</Text>
            <View style={styles.presetGrid}>
              {COLOR_PRESETS.map((preset) => {
                const isSelected =
                  selectedColor.toUpperCase() === preset.hex.toUpperCase();
                return (
                  <Pressable
                    key={preset.id}
                    onPress={() => handlePresetPress(preset)}
                    style={({ pressed }) => [
                      styles.presetItem,
                      isSelected && {
                        borderColor: preset.hex,
                        backgroundColor: "rgba(255, 255, 255, 0.08)",
                      },
                      pressed && styles.pressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.swatch,
                        {
                          backgroundColor: preset.hex,
                          shadowColor: preset.hex,
                        },
                      ]}
                    />
                    <View style={styles.presetTextContainer}>
                      <Text style={styles.presetName}>{preset.name}</Text>
                      <Text style={styles.presetDesc}>
                        {preset.description}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* Custom Hex Input */}
            <View style={styles.rowSection}>
              <View style={styles.customHexContainer}>
                <Text style={styles.sectionLabel}>CUSTOM HEX COLOUR</Text>
                <View style={styles.hexInputWrapper}>
                  <View
                    style={[
                      styles.hexPreviewDot,
                      { backgroundColor: selectedColor },
                    ]}
                  />
                  <TextInput
                    value={customHex}
                    onChangeText={handleCustomHexChange}
                    placeholder="#E6E600"
                    placeholderTextColor="#555"
                    maxLength={7}
                    autoCapitalize="characters"
                    style={[styles.hexInput, hexError && styles.hexInputError]}
                  />
                </View>
              </View>

              {/* Time Format Toggle */}
              <View style={styles.formatContainer}>
                <Text style={styles.sectionLabel}>TIME FORMAT</Text>
                <View style={styles.formatToggleGroup}>
                  <Pressable
                    onPress={() => onToggle24Hour(true)}
                    style={[
                      styles.formatBtn,
                      use24Hour && {
                        backgroundColor: selectedColor,
                        borderColor: selectedColor,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.formatBtnText,
                        use24Hour && styles.formatBtnTextActive,
                      ]}
                    >
                      24-HOUR
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => onToggle24Hour(false)}
                    style={[
                      styles.formatBtn,
                      !use24Hour && {
                        backgroundColor: selectedColor,
                        borderColor: selectedColor,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.formatBtnText,
                        !use24Hour && styles.formatBtnTextActive,
                      ]}
                    >
                      12-HOUR
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Launch Button */}
          <Pressable
            onPress={onStartClock}
            style={({ pressed }) => [
              styles.launchButton,
              { backgroundColor: selectedColor },
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.launchButtonText}>
              {isInitialStartup
                ? "LAUNCH FULLSCREEN CLOCK"
                : "APPLY & RETURN TO CLOCK"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.88)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 540,
    maxHeight: "92%",
    backgroundColor: "#0A0A0A",
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 10,
    marginRight: 14,
  },
  headerText: {
    flex: 1,
  },
  badge: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    color: "#999999",
    fontSize: 13,
    lineHeight: 18,
  },
  previewBox: {
    backgroundColor: "#000000",
    borderWidth: 1,
    borderColor: "#222222",
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  previewTime: {
    fontFamily: "DSEG7Classic-BoldItalic",
    fontSize: 36,
    letterSpacing: 2,
    marginBottom: 10,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  previewDate: {
    fontFamily: "DSEG14Classic-Italic",
    fontSize: 13,
    letterSpacing: 1.5,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  scrollArea: {
    marginBottom: 16,
  },
  sectionLabel: {
    color: "#777777",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  presetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
  },
  presetItem: {
    width: "48%",
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121212",
    borderWidth: 1.5,
    borderColor: "#262626",
    borderRadius: 10,
    padding: 10,
  },
  swatch: {
    width: 22,
    height: 22,
    borderRadius: 6,
    marginRight: 10,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  presetTextContainer: {
    flex: 1,
  },
  presetName: {
    color: "#F0F0F0",
    fontSize: 13,
    fontWeight: "600",
  },
  presetDesc: {
    color: "#777777",
    fontSize: 10,
    marginTop: 1,
  },
  rowSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 6,
  },
  customHexContainer: {
    flex: 1,
    minWidth: 180,
  },
  hexInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121212",
    borderWidth: 1.5,
    borderColor: "#262626",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
  },
  hexPreviewDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 8,
  },
  hexInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  hexInputError: {
    color: "#FF4444",
  },
  formatContainer: {
    flex: 1,
    minWidth: 180,
  },
  formatToggleGroup: {
    flexDirection: "row",
    gap: 8,
    height: 42,
  },
  formatBtn: {
    flex: 1,
    backgroundColor: "#121212",
    borderWidth: 1.5,
    borderColor: "#262626",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  formatBtnText: {
    color: "#AAAAAA",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  formatBtnTextActive: {
    color: "#000000",
  },
  launchButton: {
    height: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  launchButtonText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  pressed: {
    opacity: 0.8,
  },
});
