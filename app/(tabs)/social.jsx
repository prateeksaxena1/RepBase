import { View, Text, FlatList, TouchableOpacity,
  TextInput, RefreshControl, ActivityIndicator,
  Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius } from '../../constants/theme';
import { getFeed, getPublicFeed, likePost,
  unlikePost } from '../../lib/social';
import useAuthStore from '../../store/useAuthStore';

export default function Social() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState('following');

  const loadFeed = async () => {
    try {
      const data = tab === 'following'
        ? await getFeed()
        : await getPublicFeed();
      setPosts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => {
    setLoading(true);
    loadFeed();
  }, [tab]));

  const handleLike = async (post) => {
    const alreadyLiked = post.likes?.some((l) => l.user_id === user?.id);
    try {
      if (alreadyLiked) await unlikePost(post.id);
      else await likePost(post.id);
      loadFeed();
    } catch (e) { console.error(e); }
  };

  const formatDuration = (secs) => {
    if (!secs) return '';
    const m = Math.floor(secs / 60);
    return `${m}m`;
  };

  const PostCard = ({ post }) => {
    const liked = post.likes?.some((l) => l.user_id === user?.id);
    const likeCount = post.likes?.length || 0;
    const commentCount = post.comments?.length || 0;
    const totalSets = post.sessions?.session_sets?.length || 0;
    const totalVolume = post.sessions?.session_sets?.reduce(
      (sum, s) => sum + (s.weight_kg || 0) * (s.reps || 0), 0
    ) || 0;

    return (
      <View style={{ backgroundColor: colors.surface,
        borderRadius: radius.card, padding: 16,
        marginBottom: 12, borderWidth: 1,
        borderColor: colors.border }}>

        {/* Header */}
        <TouchableOpacity
          onPress={() => router.push(`/social/profile/${post.profiles?.id}`)}
          style={{ flexDirection: 'row', alignItems: 'center',
            gap: 10, marginBottom: 12 }}>
          <View style={{ width: 40, height: 40, borderRadius: 20,
            backgroundColor: colors.accent, alignItems: 'center',
            justifyContent: 'center' }}>
            <Text style={{ color: '#0D0D0D', fontSize: font.md,
              fontWeight: '900' }}>
              {post.profiles?.username?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
          <View>
            <Text style={{ color: colors.white, fontSize: font.md,
              fontWeight: '800' }}>
              {post.profiles?.username || 'Athlete'}
            </Text>
            <Text style={{ color: colors.muted, fontSize: 11 }}>
              {post.sessions?.date} ·
              {formatDuration(post.sessions?.duration_secs)}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Caption */}
        {!!post.caption && (
          <Text style={{ color: colors.white, fontSize: font.md,
            marginBottom: 12, lineHeight: 20 }}>
            {post.caption}
          </Text>
        )}

        {/* Workout stats */}
        <View style={{ flexDirection: 'row', gap: 10,
          marginBottom: 12 }}>
          {[
            { label: 'Sets', value: totalSets },
            { label: 'Volume', value: `${Math.round(totalVolume)}kg` },
          ].map((stat) => (
            <View key={stat.label} style={{
              backgroundColor: colors.dark, borderRadius: 8,
              paddingHorizontal: 12, paddingVertical: 8,
              alignItems: 'center', flex: 1,
              borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ color: colors.accent, fontSize: font.lg,
                fontWeight: '900' }}>{stat.value}</Text>
              <Text style={{ color: colors.muted, fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: 0.5 }}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={{ flexDirection: 'row', gap: 16,
          borderTopWidth: 1, borderTopColor: colors.border,
          paddingTop: 12 }}>
          <TouchableOpacity
            onPress={() => handleLike(post)}
            style={{ flexDirection: 'row', alignItems: 'center',
              gap: 6 }}>
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={22}
              color={liked ? '#FF4444' : colors.muted}
            />
            <Text style={{ color: colors.muted,
              fontSize: font.sm }}>{likeCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push(`/social/post/${post.id}`)}
            style={{ flexDirection: 'row', alignItems: 'center',
              gap: 6 }}>
            <Ionicons name="chatbubble-outline"
              size={20} color={colors.muted} />
            <Text style={{ color: colors.muted,
              fontSize: font.sm }}>{commentCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ marginLeft: 'auto' }}
            onPress={() => router.push(`/social/profile/${post.profiles?.id}`)}>
            <Ionicons name="person-outline"
              size={20} color={colors.muted} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ padding: 20, paddingBottom: 0 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row',
          justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 16 }}>
          <Text style={{ color: colors.white, fontSize: 28,
            fontWeight: '900' }}>Community</Text>
          <TouchableOpacity
            onPress={() => router.push('/social/search')}
            style={{ backgroundColor: colors.surface,
              borderRadius: 10, padding: 10,
              borderWidth: 1, borderColor: colors.border }}>
            <Ionicons name="search-outline"
              size={20} color={colors.accent} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: 'row', gap: 8,
          marginBottom: 16 }}>
          {['following', 'discover'].map((t) => (
            <TouchableOpacity key={t} onPress={() => setTab(t)}
              style={{ flex: 1, paddingVertical: 10,
                borderRadius: 10, alignItems: 'center',
                backgroundColor: tab === t
                  ? colors.accent : colors.surface,
                borderWidth: 1,
                borderColor: tab === t
                  ? colors.accent : colors.border }}>
              <Text style={{
                color: tab === t ? '#0D0D0D' : colors.muted,
                fontSize: font.sm, fontWeight: '800',
                textTransform: 'uppercase', letterSpacing: 0.5,
              }}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.accent}
          style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PostCard post={item} />}
          contentContainerStyle={{ padding: 20, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadFeed(); }}
              tintColor={colors.accent}
            />
          }
          ListEmptyComponent={() => (
            <View style={{ alignItems: 'center',
              paddingTop: 60 }}>
              <Ionicons name="people-outline"
                size={48} color={colors.dim} />
              <Text style={{ color: colors.white,
                fontSize: font.lg, fontWeight: '800',
                marginTop: 16, textAlign: 'center' }}>
                {tab === 'following'
                  ? 'No posts yet'
                  : 'No workouts shared yet'}
              </Text>
              <Text style={{ color: colors.muted,
                fontSize: font.sm, textAlign: 'center',
                marginTop: 8 }}>
                {tab === 'following'
                  ? 'Follow athletes to see their workouts'
                  : 'Be the first to share a workout!'}
              </Text>
              {tab === 'following' && (
                <TouchableOpacity
                  onPress={() => setTab('discover')}
                  style={{ marginTop: 20,
                    backgroundColor: colors.accent,
                    borderRadius: radius.button,
                    paddingHorizontal: 24,
                    paddingVertical: 12 }}>
                  <Text style={{ color: '#0D0D0D',
                    fontWeight: '900', fontSize: font.md,
                    textTransform: 'uppercase' }}>
                    Discover Athletes
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
