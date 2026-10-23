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
  useWindowDimensions,
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
  const { height } = useWindowDimensions();
  const compact = height < 500;
  const [step, setStep] = useState<"colour" | "format">("colour");
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
      onShow={() => {
        setStep("colour");
        setCustomHex(selectedColor);
        setHexError(false);
      }}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            {
              borderColor: selectedColor,
              height: Math.min(height - 24, 680),
              padding: compact ? 14 : 24,
              borderRadius: compact ? 12 : 16,
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, compact && styles.headerCompact]}>
            <Image
              source={require("../../assets/icon.png")}
              style={[styles.logo, compact && styles.logoCompact]}
            />
            <View style={styles.headerText}>
              <Text style={styles.title}>
                {isInitialStartup
                  ? "Configure Display Colour"
                  : "Display Settings"}
              </Text>
              <Text style={styles.subtitle}>
                {step === "colour"
                  ? "Step 1 of 2 · Choose an LED segment colour."
                  : "Step 2 of 2 · Choose your clock format and review."}
              </Text>
            </View>
          </View>

          <ScrollView
            style={styles.stepContent}
            contentContainerStyle={styles.stepContentContainer}
            showsVerticalScrollIndicator={false}
          >
            {step === "colour" ? (
              <>
                <Text style={styles.sectionLabel}>LED COLOUR PRESETS</Text>
                <View style={styles.presetGrid}>
                  {COLOR_PRESETS.map((preset) => {
                    const isSelected =
                      selectedColor.toUpperCase() === preset.hex.toUpperCase();
                    return (
                      <Pressable
                        key={preset.id}
                        onPress={() => handlePresetPress(preset)}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: isSelected }}
                        accessibilityLabel={`${preset.name}, ${preset.description}`}
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
                      accessibilityLabel="Custom hex colour"
                      style={[
                        styles.hexInput,
                        hexError && styles.hexInputError,
                      ]}
                    />
                  </View>
                  {hexError && (
                    <Text style={styles.hexErrorText} accessibilityRole="alert">
                      Enter a valid hex colour.
                    </Text>
                  )}
                </View>
              </>
            ) : (
              <>
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

                <View style={styles.formatContainer}>
                  <Text style={styles.sectionLabel}>TIME FORMAT</Text>
                  <View style={styles.formatToggleGroup}>
                    <Pressable
                      onPress={() => onToggle24Hour(true)}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: use24Hour }}
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
                      accessibilityRole="radio"
                      accessibilityState={{ checked: !use24Hour }}
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
              </>
            )}
          </ScrollView>

          <View style={styles.footer}>
            {step === "format" && (
              <Pressable
                onPress={() => setStep("colour")}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.backButtonText}>BACK</Text>
              </Pressable>
            )}
            <Pressable
              onPress={
                step === "colour"
                  ? () => setStep("format")
                  : onStartClock
              }
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.launchButton,
                { backgroundColor: selectedColor },
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.launchButtonText}>
                {step === "colour"
                  ? "NEXT: TIME FORMAT"
                  : isInitialStartup
                    ? "LAUNCH FULLSCREEN CLOCK"
                    : "APPLY & RETURN TO CLOCK"}
              </Text>
            </Pressable>
          </View>
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
    padding: 12,
  },
  card: {
    width: "100%",
    maxWidth: 640,
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
  headerCompact: {
    marginBottom: 8,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 10,
    marginRight: 14,
  },
  logoCompact: {
    width: 38,
    height: 38,
    marginRight: 10,
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
  stepContent: {
    flex: 1,
    minHeight: 0,
  },
  stepContentContainer: {
    flexGrow: 1,
    paddingBottom: 8,
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
    gap: 8,
    marginBottom: 18,
  },
  presetItem: {
    width: "49%",
    flexGrow: 1,
    minHeight: 48,
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
  customHexContainer: {
    width: "100%",
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
  hexErrorText: {
    color: "#FF6666",
    fontSize: 11,
    marginTop: 5,
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
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 10,
  },
  backButton: {
    minWidth: 76,
    height: 48,
    borderWidth: 1,
    borderColor: "#444444",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  launchButton: {
    flex: 1,
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
