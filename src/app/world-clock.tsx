import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Modal, PanResponder, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { ClockToolLayout, toolColors, toolStyles } from '@/components/ClockToolLayout';
import { WORLD_CLOCK_CITIES, WorldClockCity } from '@/constants/worldClocks';
import { useClockPreferences } from '@/hooks/useClockPreferences';

const STORAGE_KEY = 'digiclock.worldCities';
const SELECTED_STORAGE_KEY = 'digiclock.selectedWorldCity';

export default function WorldClockScreen() {
  const { width } = useWindowDimensions();
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [now, setNow] = useState(() => new Date());
  const [loaded, setLoaded] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(true);
  const { color, use24Hour } = useClockPreferences();

  useEffect(() => {
    let active = true;
    Promise.all([
      AsyncStorage.getItem(STORAGE_KEY),
      AsyncStorage.getItem(SELECTED_STORAGE_KEY),
    ]).then(([savedRaw, selectedRaw]) => {
      if (!active) return;
      let ids: string[] = [];
      if (savedRaw) {
        const parsed: unknown = JSON.parse(savedRaw);
        if (Array.isArray(parsed)) ids = parsed.filter((id): id is string => typeof id === 'string' && WORLD_CLOCK_CITIES.some((city) => city.id === id));
      }
      setSavedIds(ids);
      const remembered = selectedRaw && ids.includes(selectedRaw) ? selectedRaw : ids[0] ?? null;
      setSelectedId(remembered);
    }).catch(() => {}).finally(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(savedIds)).catch(() => {});
    if (selectedId) AsyncStorage.setItem(SELECTED_STORAGE_KEY, selectedId).catch(() => {});
    else AsyncStorage.removeItem(SELECTED_STORAGE_KEY).catch(() => {});
  }, [loaded, savedIds, selectedId]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const savedCities = useMemo(
    () => savedIds.map((id) => WORLD_CLOCK_CITIES.find((city) => city.id === id)).filter((city): city is WorldClockCity => Boolean(city)),
    [savedIds]
  );
  const selectedCity = savedCities.find((city) => city.id === selectedId) ?? null;
  const searchResults = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    const cities = needle
      ? WORLD_CLOCK_CITIES.filter((city) => `${city.name} ${city.country} ${city.timeZone}`.toLocaleLowerCase().includes(needle))
      : savedCities;
    return cities;
  }, [query, savedCities]);

  const changeCity = useCallback((direction: -1 | 1) => {
    if (!savedCities.length) {
      setPickerVisible(true);
      return;
    }
    const index = savedCities.findIndex((city) => city.id === selectedId);
    const nextIndex = (index + direction + savedCities.length) % savedCities.length;
    setSelectedId(savedCities[nextIndex].id);
  }, [savedCities, selectedId]);

  const panResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_event, gesture) => Math.abs(gesture.dx) > 28 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
    onPanResponderRelease: (_event, gesture) => {
      if (gesture.dx < -45) changeCity(1);
      if (gesture.dx > 45) changeCity(-1);
    },
  }), [changeCity]);

  const selectCity = (city: WorldClockCity) => {
    setSavedIds((ids) => ids.includes(city.id) ? ids : [...ids, city.id]);
    setSelectedId(city.id);
    setQuery('');
    setPickerVisible(false);
  };

  const removeCity = (city: WorldClockCity) => {
    const next = savedCities.filter((item) => item.id !== city.id);
    setSavedIds(next.map((item) => item.id));
    if (selectedId === city.id) {
      setSelectedId(next[0]?.id ?? null);
      if (!next.length) setPickerVisible(true);
    }
  };

  const timeFontSize = Math.max(20, Math.min(width / 6, 300));
  const footerDate = selectedCity
    ? new Intl.DateTimeFormat(undefined, { timeZone: selectedCity.timeZone, weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' }).format(now).toUpperCase()
    : '';
  const footerText = selectedCity ? `${selectedCity.country.toUpperCase()} - ${footerDate}` : 'SELECT A CITY';

  return (
    <ClockToolLayout
      title="WORLD CLOCK"
      subtitle={selectedCity?.name.toUpperCase() ?? 'CHOOSE A CITY'}
      footer={<Text numberOfLines={1} adjustsFontSizeToFit style={[styles.footer, { fontSize: Math.max(10, Math.min(16, width * 0.019)), color, textShadowColor: color }]}>{footerText}</Text>}
      actions={(
        <Pressable onPress={() => { setQuery(''); setPickerVisible(true); }} accessibilityRole="button" accessibilityLabel="Choose or manage cities" style={styles.headerAction}>
          <Text style={styles.headerActionText}>CITIES</Text>
        </Pressable>
      )}
      renderFace={({ fontSize }) => (
        <View {...panResponder.panHandlers} style={styles.faceContent}>
          <Text adjustsFontSizeToFit numberOfLines={1} style={[toolStyles.time, { fontSize: Math.min(fontSize, timeFontSize), color, textShadowColor: color }]}>
            {selectedCity ? now.toLocaleTimeString(undefined, { timeZone: selectedCity.timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: !use24Hour }) : '--:--:--'}
          </Text>
          {savedCities.length > 1 ? <Text style={styles.hint}>SWIPE TO CHANGE CITY</Text> : null}
        </View>
      )}
    >
      <CityPickerDialog
        visible={pickerVisible}
        query={query}
        results={searchResults}
        savedIds={savedIds}
        onQueryChange={setQuery}
        onSelect={selectCity}
        onRemove={removeCity}
        onClose={() => setPickerVisible(false)}
      />
    </ClockToolLayout>
  );
}

function CityPickerDialog({
  visible, query, results, savedIds, onQueryChange, onSelect, onRemove, onClose,
}: {
  visible: boolean;
  query: string;
  results: WorldClockCity[];
  savedIds: string[];
  onQueryChange: (value: string) => void;
  onSelect: (city: WorldClockCity) => void;
  onRemove: (city: WorldClockCity) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.dialog}>
          <View style={styles.dialogHeader}>
            <View>
              <Text style={styles.dialogTitle}>WORLD CLOCKS</Text>
              <Text style={styles.dialogSubtitle}>SELECT OR ADD A CITY</Text>
            </View>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close city picker" style={styles.closeButton}>
              <Text style={styles.closeText}>DONE</Text>
            </Pressable>
          </View>
          <TextInput
            value={query}
            onChangeText={onQueryChange}
            placeholder="Search city, country, or time zone"
            placeholderTextColor="rgba(255,255,255,0.38)"
            autoCapitalize="words"
            style={styles.search}
            accessibilityLabel="Search cities and time zones"
          />
          <ScrollView style={styles.cityList} keyboardShouldPersistTaps="handled">
            {results.length ? results.map((city) => {
              const saved = savedIds.includes(city.id);
              return (
                <View key={city.id} style={styles.cityRow}>
                  <Pressable onPress={() => onSelect(city)} style={styles.citySelect} accessibilityRole="button">
                    <Text style={styles.cityName}>{city.name}</Text>
                    <Text style={styles.country}>{city.country} · {city.timeZone}</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => saved ? onRemove(city) : onSelect(city)}
                    accessibilityRole="button"
                    accessibilityLabel={saved ? `Remove ${city.name}` : `Add ${city.name}`}
                    style={styles.cityAction}
                  >
                    <Text style={[styles.cityActionText, saved && styles.removeText]}>{saved ? 'REMOVE' : 'ADD +'}</Text>
                  </Pressable>
                </View>
              );
            }) : <Text style={styles.noResults}>No matching cities in the offline list.</Text>}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  faceContent: { width: '100%', alignItems: 'center', paddingHorizontal: 8 },
  hint: { color: 'rgba(255,255,255,0.4)', fontSize: 9, letterSpacing: 1.5, marginTop: 18 },
  footer: { color: toolColors.accent, fontFamily: 'DSEG14Classic-Italic', letterSpacing: 1.2, textAlign: 'center', textShadowColor: toolColors.accent, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 7 },
  headerAction: { minWidth: 72, minHeight: 38, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: toolColors.line },
  headerActionText: { color: '#FFFFFF', fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  modalBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 18, backgroundColor: 'rgba(0,0,0,0.86)' },
  dialog: { width: '100%', maxWidth: 620, maxHeight: '86%', padding: 20, borderWidth: 1, borderColor: 'rgba(230,230,0,0.52)', backgroundColor: '#090909' },
  dialogHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  dialogTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', letterSpacing: 1.8 },
  dialogSubtitle: { color: toolColors.muted, fontSize: 8, letterSpacing: 1, marginTop: 4 },
  closeButton: { minWidth: 72, minHeight: 38, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: toolColors.line },
  closeText: { color: toolColors.accent, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  search: { height: 42, borderWidth: 1, borderColor: toolColors.line, paddingHorizontal: 12, color: '#FFFFFF', fontSize: 11, backgroundColor: '#050505' },
  cityList: { marginTop: 10, minHeight: 150 },
  cityRow: { minHeight: 52, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  citySelect: { flex: 1, justifyContent: 'center', minHeight: 50 },
  cityName: { color: '#FFFFFF', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  country: { color: toolColors.muted, fontSize: 8, marginTop: 4 },
  cityAction: { minWidth: 68, minHeight: 40, alignItems: 'center', justifyContent: 'center' },
  cityActionText: { color: toolColors.accent, fontSize: 8, fontWeight: '700', letterSpacing: 1 },
  removeText: { color: '#FF7777' },
  noResults: { color: toolColors.muted, fontSize: 10, paddingVertical: 18, textAlign: 'center' },
});
