import React, { useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ClockToolLayout, toolColors } from '@/components/ClockToolLayout';
import { WORLD_CLOCK_CITIES, WorldClockCity } from '@/constants/worldClocks';

const STORAGE_KEY = 'digiclock.worldCities';

export default function WorldClockScreen() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [now, setNow] = useState(() => new Date());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (!active || !value) return;
        const parsed: unknown = JSON.parse(value);
        if (Array.isArray(parsed)) {
          setSavedIds(parsed.filter((id): id is string => typeof id === 'string' && WORLD_CLOCK_CITIES.some((city) => city.id === id)));
        }
      })
      .catch(() => {})
      .finally(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(savedIds)).catch(() => {});
  }, [loaded, savedIds]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const savedCities = useMemo(
    () => savedIds.map((id) => WORLD_CLOCK_CITIES.find((city) => city.id === id)).filter((city): city is WorldClockCity => Boolean(city)),
    [savedIds]
  );
  const results = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    if (!search) return [];
    return WORLD_CLOCK_CITIES.filter((city) => !savedIds.includes(city.id) && `${city.name} ${city.region} ${city.timeZone}`.toLocaleLowerCase().includes(search));
  }, [query, savedIds]);

  const addCity = (city: WorldClockCity) => {
    setSavedIds((current) => [...current, city.id]);
    setQuery('');
  };

  return (
    <ClockToolLayout title="WORLD CLOCK" subtitle="LOCAL TIMES AROUND THE WORLD">
      <View style={styles.content}>
        <View style={styles.searchBlock}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search city or time zone"
            placeholderTextColor="rgba(255,255,255,0.36)"
            autoCapitalize="words"
            style={styles.search}
            accessibilityLabel="Search cities and time zones"
          />
          {query.trim() ? (
            <ScrollView style={styles.results} keyboardShouldPersistTaps="handled">
              {results.length ? results.map((city) => (
                <Pressable key={city.id} onPress={() => addCity(city)} style={styles.result} accessibilityRole="button">
                  <View><Text style={styles.cityName}>{city.name}</Text><Text style={styles.region}>{city.region}</Text></View>
                  <Text style={styles.add}>ADD +</Text>
                </Pressable>
              )) : <Text style={styles.noResults}>No matching cities in the offline catalog.</Text>}
            </ScrollView>
          ) : null}
        </View>
        <View style={styles.clockList}>
          {savedCities.length === 0 ? (
            <Text style={styles.empty}>SEARCH FOR A CITY TO ADD A CLOCK</Text>
          ) : (
            <FlatList
              data={savedCities}
              keyExtractor={(city) => city.id}
              renderItem={({ item }) => <CityRow city={item} now={now} onRemove={() => setSavedIds((ids) => ids.filter((id) => id !== item.id))} />}
              initialNumToRender={8}
              windowSize={5}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
      </View>
    </ClockToolLayout>
  );
}

function CityRow({ city, now, onRemove }: { city: WorldClockCity; now: Date; onRemove: () => void }) {
  const time = now.toLocaleTimeString(undefined, { timeZone: city.timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const date = new Intl.DateTimeFormat(undefined, { timeZone: city.timeZone, weekday: 'short', month: 'short', day: 'numeric' }).format(now).toUpperCase();
  const zone = new Intl.DateTimeFormat(undefined, { timeZone: city.timeZone, timeZoneName: 'short' }).formatToParts(now).find((part) => part.type === 'timeZoneName')?.value ?? city.timeZone;
  return (
    <View style={styles.cityRow}>
      <View style={styles.cityMeta}>
        <Text style={styles.cityName}>{city.name}</Text>
        <Text style={styles.region}>{date} · {zone}</Text>
      </View>
      <Text style={styles.time}>{time}</Text>
      <Pressable onPress={onRemove} accessibilityRole="button" accessibilityLabel={`Remove ${city.name}`} style={styles.remove}>
        <Text style={styles.removeText}>×</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { width: '100%', flex: 1, maxWidth: 760, alignSelf: 'center' },
  searchBlock: { zIndex: 2 },
  search: { height: 42, borderWidth: 1, borderColor: toolColors.line, paddingHorizontal: 13, color: '#FFFFFF', fontSize: 12, backgroundColor: '#080808' },
  results: { maxHeight: 190, borderWidth: 1, borderTopWidth: 0, borderColor: toolColors.line, backgroundColor: '#090909' },
  result: { minHeight: 48, paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  add: { color: toolColors.accent, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  noResults: { color: toolColors.muted, fontSize: 11, padding: 14 },
  clockList: { flex: 1, marginTop: 12, borderTopWidth: 1, borderTopColor: toolColors.line },
  listContent: { paddingBottom: 8 },
  empty: { color: 'rgba(255,255,255,0.35)', fontSize: 9, textAlign: 'center', letterSpacing: 1.5, marginTop: 24 },
  cityRow: { minHeight: 62, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.09)', paddingHorizontal: 4 },
  cityMeta: { flex: 1 },
  cityName: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', letterSpacing: 0.6 },
  region: { color: toolColors.muted, fontSize: 9, marginTop: 4, letterSpacing: 0.4 },
  time: { color: toolColors.accent, fontFamily: 'DSEG7Classic-BoldItalic', fontSize: 20, fontVariant: ['tabular-nums'], marginHorizontal: 12 },
  remove: { width: 34, height: 38, alignItems: 'center', justifyContent: 'center' },
  removeText: { color: 'rgba(255,255,255,0.55)', fontSize: 23 },
});
