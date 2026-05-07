import { View, Text, TextInput, FlatList,
  TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { searchProfiles } from '../../lib/social';
import { colors, font, radius } from '../../constants/theme';

export default function SearchUsers() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await searchProfiles(query.trim());
      setResults(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flexDirection: 'row',
        alignItems: 'center', padding: 20,
        paddingBottom: 10, gap: 12 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back"
            size={24} color={colors.white} />
        </TouchableOpacity>
        <View style={{ flex: 1, flexDirection: 'row',
          alignItems: 'center', backgroundColor: colors.surface,
          borderRadius: radius.input, borderWidth: 1,
          borderColor: colors.border, paddingHorizontal: 12 }}>
          <Ionicons name="search-outline"
            size={16} color={colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            placeholder="Search athletes..."
            placeholderTextColor={colors.dim}
            returnKeyType="search"
            autoFocus
            style={{ flex: 1, color: colors.white,
              fontSize: font.md, padding: 12 }}
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.accent}
          style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.push(`/social/profile/${item.id}`)}
              style={{ backgroundColor: colors.surface,
                borderRadius: radius.card, padding: 14,
                marginBottom: 10, borderWidth: 1,
                borderColor: colors.border,
                flexDirection: 'row', alignItems: 'center',
                gap: 12 }}>
              <View style={{ width: 44, height: 44,
                borderRadius: 22,
                backgroundColor: colors.accent,
                alignItems: 'center',
                justifyContent: 'center' }}>
                <Text style={{ color: '#0D0D0D',
                  fontSize: font.lg, fontWeight: '900' }}>
                  {item.username?.[0]?.toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={{ color: colors.white,
                  fontSize: font.md,
                  fontWeight: '800' }}>@{item.username}</Text>
                {!!item.bio && (
                  <Text numberOfLines={1}
                    style={{ color: colors.muted,
                      fontSize: font.sm }}>{item.bio}</Text>
                )}
              </View>
              <Ionicons name="chevron-forward"
                size={16} color={colors.dim}
                style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => query ? (
            <View style={{ alignItems: 'center',
              paddingTop: 40 }}>
              <Text style={{ color: colors.muted,
                fontSize: font.md }}>
                No athletes found for "{query}"
              </Text>
            </View>
          ) : null}
        />
      )}
    </SafeAreaView>
  );
}
