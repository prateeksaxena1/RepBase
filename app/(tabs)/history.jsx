import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import SessionCard from '../../components/SessionCard';
import EmptyState from '../../components/EmptyState';
import { getAllSessions } from '../../db/sessions';
import { colors } from '../../constants/theme';
import SkeletonCard from '../../components/SkeletonCard';

export default function History() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    setSessions(getAllSessions());
    setLoading(false);
  }, []));

  if (loading) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ padding: 20 }}>
        {[1,2,3,4].map((i) => <SkeletonCard key={i} height={90} />)}
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <Animatable.View animation="fadeInUp" duration={400} style={{ flex: 1 }}>
        <View style={{ flex: 1, padding: 20 }}>
          <Text style={{ color: colors.white, fontSize: 28,
          fontWeight: '900', marginBottom: 20 }}>History</Text>
        {sessions.length === 0 ? (
          <EmptyState
            icon="time-outline"
            title="No workouts yet"
            subtitle="Complete your first workout to see it here"
          />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {sessions.map((s) => (
              <SessionCard key={s.id} session={s} />
            ))}
          </ScrollView>
        )}
      </View>
      </Animatable.View>
    </SafeAreaView>
  );
}
