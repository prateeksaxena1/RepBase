import { View, Text, ScrollView, TouchableOpacity, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { colors, font, radius } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function WorkoutSummary() {
  const params = useLocalSearchParams();
  
  const duration = parseInt(params.duration || 0);
  const totalSets = parseInt(params.totalSets || 0);
  const totalVolume = parseFloat(params.totalVolume || 0);
  const prs = parseInt(params.prs || 0);
  
  const exerciseData = params.exerciseData ? JSON.parse(params.exerciseData) : [];

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const handleShare = async () => {
    try {
      let message = `💪 Workout Complete!\n⏱️ Duration: ${formatTime(duration)}\n🔄 Sets: ${totalSets}\n🏋️ Volume: ${totalVolume}kg\n🏆 PRs: ${prs}\n\n`;
      exerciseData.forEach(ex => {
        message += `- ${ex.name}: ${ex.sets} sets (Best: ${ex.bestWeight}kg x ${ex.bestReps})\n`;
      });
      await Share.share({ message });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={{ alignItems: 'center', marginVertical: 30 }}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>🎉</Text>
          <Text style={{ color: colors.white, fontSize: 28, fontWeight: '900', textAlign: 'center' }}>
            Workout Complete!
          </Text>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 30 }}>
          {[
            { label: 'Duration', value: formatTime(duration) },
            { label: 'Total Sets', value: totalSets },
            { label: 'Total Volume', value: `${totalVolume} kg` },
            { label: 'PRs Achieved', value: prs }
          ].map((stat) => (
            <View key={stat.label} style={{ width: '48%', backgroundColor: colors.surface,
              borderRadius: radius.card, padding: 16,
              borderWidth: 1, borderColor: colors.border, alignItems: 'center' }}>
              <Text style={{ color: colors.accent, fontSize: 24, fontWeight: '900', marginBottom: 4 }}>
                {stat.value}
              </Text>
              <Text style={{ color: colors.muted, fontSize: 11, textTransform: 'uppercase' }}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        <Text style={{ color: colors.white, fontSize: 18, fontWeight: '800', marginBottom: 12 }}>
          Exercise Breakdown
        </Text>
        {exerciseData.map((ex, i) => (
          <View key={i} style={{ backgroundColor: colors.surface, borderRadius: radius.card,
            padding: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.white, fontSize: font.md, fontWeight: '700', marginBottom: 4 }}>
              {ex.name}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.muted, fontSize: font.sm }}>{ex.sets} sets completed</Text>
              <Text style={{ color: colors.accent, fontSize: font.sm }}>
                Best: {ex.bestWeight}kg × {ex.bestReps}
              </Text>
            </View>
          </View>
        ))}

        <TouchableOpacity onPress={handleShare} style={{ backgroundColor: colors.surface,
          borderRadius: radius.button, padding: 16, alignItems: 'center', marginTop: 20,
          borderWidth: 1, borderColor: colors.accent }}>
          <Text style={{ color: colors.accent, fontWeight: '900', fontSize: font.md,
            textTransform: 'uppercase', letterSpacing: 1 }}>Share Workout</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/(tabs)/history')} style={{ backgroundColor: colors.accent,
          borderRadius: radius.button, padding: 16, alignItems: 'center', marginTop: 12, marginBottom: 40 }}>
          <Text style={{ color: '#0D0D0D', fontWeight: '900', fontSize: font.md,
            textTransform: 'uppercase', letterSpacing: 1 }}>Done</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
