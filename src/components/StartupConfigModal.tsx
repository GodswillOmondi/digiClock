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

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return `rgba(230, 230, 0, ${alpha})`;
}

const WEB_GLASS_BACKDROP = Platform.select({
  web: {
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  } as Record<string, unknown>,
});

const WEB_GLASS_CARD = Platform.select({
  web: {
    backdropFilter: "blur(24px) saturate(180%)",
    WebkitBackdropFilter: "blur(24px) saturate(180%)",
  } as Record<string, unknown>,
});

const WEB_GLASS_PANEL = Platform.select({
  web: {
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
  } as Record<string, unknown>,
});

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
              borderColor: hexToRgba(selectedColor, 0.45),
              shadowColor: selectedColor,
              height: Math.min(height - 24, 680),
              padding: compact ? 14 : 24,
            },
          ]}
        >
          {/* Glassmorphism internal light reflections & ambient tint */}
          <View
            pointerEvents="none"
            style={[
              styles.glassAmbientGlow,
              { backgroundColor: hexToRgba(selectedColor, 0.08) },
            ]}
          />
          <View pointerEvents="none" style={styles.glassTopHighlight} />
          <View pointerEvents="none" style={styles.glassInnerSheen} />

          {/* Sharp HUD Tech Corner Accents */}
          <View
            pointerEvents="none"
            style={[
              styles.cornerBracket,
              styles.cornerTopLeft,
              { borderColor: selectedColor },
            ]}
          />
          <View
            pointerEvents="none"
            style={[
              styles.cornerBracket,
              styles.cornerTopRight,
              { borderColor: selectedColor },
            ]}
          />
          <View
            pointerEvents="none"
            style={[
              styles.cornerBracket,
              styles.cornerBottomLeft,
              { borderColor: selectedColor },
            ]}
          />
          <View
            pointerEvents="none"
            style={[
              styles.cornerBracket,
              styles.cornerBottomRight,
              { borderColor: selectedColor },
            ]}
          />

          {/* Header */}
          <View style={[styles.header, compact && styles.headerCompact]}>
            <View
              style={[
                styles.logoFrame,
                { borderColor: hexToRgba(selectedColor, 0.4) },
              ]}
            >
              <Image
                source={require("../../assets/icon.png")}
                style={[styles.logo, compact && styles.logoCompact]}
              />
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.badge, { color: selectedColor }]}>
                SYS.CFG // {step === "colour" ? "01" : "02"}
              </Text>
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
                            backgroundColor: hexToRgba(preset.hex, 0.14),
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
                  <View
                    style={[
                      styles.hexInputWrapper,
                      { borderColor: hexToRgba(selectedColor, 0.35) },
                    ]}
                  >
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
                      placeholderTextColor="rgba(255, 255, 255, 0.35)"
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
                <View
                  style={[
                    styles.previewBox,
                    { borderColor: hexToRgba(selectedColor, 0.35) },
                  ]}
                >
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
                {
                  backgroundColor: selectedColor,
                  borderColor: selectedColor,
                },
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
    backgroundColor: "rgba(3, 5, 9, 0.52)",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    ...WEB_GLASS_BACKDROP,
  },
  card: {
    position: "relative",
    overflow: "hidden",
    width: "100%",
    maxWidth: 640,
    backgroundColor:
      Platform.OS === "web"
        ? "rgba(14, 18, 26, 0.58)"
        : "rgba(14, 18, 26, 0.76)",
    borderRadius: 0,
    borderWidth: 1,
    padding: 24,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.45,
    shadowRadius: 28,
    elevation: 18,
    ...WEB_GLASS_CARD,
  },
  glassAmbientGlow: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  glassTopHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.32)",
  },
  glassInnerSheen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "42%",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  cornerBracket: {
    position: "absolute",
    width: 12,
    height: 12,
    zIndex: 2,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.12)",
  },
  headerCompact: {
    marginBottom: 8,
    paddingBottom: 8,
  },
  logoFrame: {
    borderWidth: 1,
    borderRadius: 0,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    marginRight: 14,
    padding: 2,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 0,
  },
  logoCompact: {
    width: 34,
    height: 34,
  },
  headerText: {
    flex: 1,
  },
  badge: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 2,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "700",
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.68)",
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
    backgroundColor: "rgba(0, 0, 0, 0.52)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
    borderRadius: 0,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    ...WEB_GLASS_PANEL,
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
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
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
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 0,
    padding: 10,
    ...WEB_GLASS_PANEL,
  },
  swatch: {
    width: 22,
    height: 22,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.35)",
    marginRight: 10,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  presetTextContainer: {
    flex: 1,
  },
  presetName: {
    color: "#F5F5F5",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  presetDesc: {
    color: "rgba(255, 255, 255, 0.55)",
    fontSize: 10,
    marginTop: 1,
  },
  customHexContainer: {
    width: "100%",
  },
  hexInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
    borderRadius: 0,
    paddingHorizontal: 12,
    height: 42,
    ...WEB_GLASS_PANEL,
  },
  hexPreviewDot: {
    width: 14,
    height: 14,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    marginRight: 10,
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
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
    ...WEB_GLASS_PANEL,
  },
  formatBtnText: {
    color: "rgba(255, 255, 255, 0.78)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  formatBtnTextActive: {
    color: "#000000",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.12)",
  },
  backButton: {
    minWidth: 82,
    height: 48,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.24)",
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    ...WEB_GLASS_PANEL,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  launchButton: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 0,
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
