import { View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { getProfile, followUser, unfollowUser,
  isFollowing, getFollowerCount,
  getFollowingCount, getUserPosts } from '../../../lib/social';
import useAuthStore from '../../../store/useAuthStore';
import { colors, font, radius } from '../../../constants/theme';

export default function PublicProfile() {
  const { id } = useLocalSearchParams();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = user?.id === id;

  const load = async () => {
    try {
      const [p, f, fc, fwc, userPosts] = await Promise.all([
        getProfile(id),
        isOwnProfile ? Promise.resolve(false) : isFollowing(id),
        getFollowerCount(id),
        getFollowingCount(id),
        getUserPosts(id),
      ]);
      setProfile(p);
      setFollowing(f);
      setFollowerCount(fc);
      setFollowingCount(fwc);
      setPosts(userPosts);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleFollow = async () => {
    try {
      if (following) {
        await unfollowUser(id);
        setFollowing(false);
        setFollowerCount((c) => c - 1);
      } else {
        await followUser(id);
        setFollowing(true);
        setFollowerCount((c) => c + 1);
      }
    } catch (e) { Alert.alert('Error', e.message); }
  };

  if (loading) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg,
      alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={colors.accent} />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView>
        {/* Header */}
        <View style={{ flexDirection: 'row',
          alignItems: 'center', padding: 20,
          paddingBottom: 0 }}>
          <TouchableOpacity onPress={() => router.back()}
            style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back"
              size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={{ color: colors.white, fontSize: 20,
            fontWeight: '900' }}>
            @{profile?.username}
          </Text>
        </View>

        {/* Profile card */}
        <View style={{ padding: 20 }}>
          <View style={{ backgroundColor: colors.surface,
            borderRadius: radius.card, padding: 20,
            borderWidth: 1, borderColor: colors.border,
            alignItems: 'center', marginBottom: 16 }}>

            {/* Avatar */}
            <View style={{ width: 80, height: 80,
              borderRadius: 40,
              backgroundColor: colors.accent,
              alignItems: 'center', justifyContent: 'center',
              marginBottom: 12 }}>
              <Text style={{ color: '#0D0D0D', fontSize: 32,
                fontWeight: '900' }}>
                {profile?.username?.[0]?.toUpperCase()}
              </Text>
            </View>

            <Text style={{ color: colors.white, fontSize: font.xl,
              fontWeight: '900' }}>{profile?.username}</Text>

            {!!profile?.bio && (
              <Text style={{ color: colors.muted,
                fontSize: font.sm, textAlign: 'center',
                marginTop: 6, lineHeight: 18 }}>
                {profile.bio}
              </Text>
            )}

            {/* Stats row */}
            <View style={{ flexDirection: 'row', gap: 0,
              marginTop: 16, width: '100%' }}>
              {[
                { label: 'Workouts', value: posts.length },
                { label: 'Followers', value: followerCount },
                { label: 'Following', value: followingCount },
              ].map((stat, i) => (
                <View key={stat.label} style={{ flex: 1,
                  alignItems: 'center',
                  borderLeftWidth: i > 0 ? 1 : 0,
                  borderLeftColor: colors.border }}>
                  <Text style={{ color: colors.white,
                    fontSize: 20, fontWeight: '900' }}>
                    {stat.value}
                  </Text>
                  <Text style={{ color: colors.muted,
                    fontSize: 10, textTransform: 'uppercase',
                    letterSpacing: 0.5 }}>{stat.label}</Text>
                </View>
              ))}
            </View>

            {/* Follow button */}
            {!isOwnProfile && (
              <TouchableOpacity onPress={handleFollow}
                style={{ marginTop: 16, width: '100%',
                  backgroundColor: following
                    ? colors.dark : colors.accent,
                  borderRadius: radius.button, padding: 12,
                  alignItems: 'center', borderWidth: 1,
                  borderColor: following
                    ? colors.border : colors.accent }}>
                <Text style={{
                  color: following ? colors.white : '#0D0D0D',
                  fontWeight: '900', fontSize: font.md,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5 }}>
                  {following ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Posts */}
          <Text style={{ color: colors.muted, fontSize: 11,
            textTransform: 'uppercase', letterSpacing: 1,
            marginBottom: 12 }}>
            Workouts · {posts.length}
          </Text>

          {posts.length === 0 ? (
            <View style={{ alignItems: 'center', paddingTop: 20 }}>
              <Text style={{ color: colors.muted,
                fontSize: font.md }}>No workouts shared yet</Text>
            </View>
          ) : (
            posts.map((post) => (
              <TouchableOpacity key={post.id}
                onPress={() => router.push(`/social/post/${post.id}`)}
                style={{ backgroundColor: colors.surface,
                  borderRadius: radius.card, padding: 14,
                  marginBottom: 10, borderWidth: 1,
                  borderColor: colors.border }}>
                <Text style={{ color: colors.white,
                  fontSize: font.md, fontWeight: '700' }}>
                  {post.sessions?.date}
                </Text>
                {!!post.caption && (
                  <Text numberOfLines={2}
                    style={{ color: colors.muted,
                      fontSize: font.sm, marginTop: 4 }}>
                    {post.caption}
                  </Text>
                )}
                <View style={{ flexDirection: 'row',
                  gap: 12, marginTop: 8 }}>
                  <Text style={{ color: colors.muted,
                    fontSize: 11 }}>
                    ❤️ {post.likes?.length || 0}
                  </Text>
                  <Text style={{ color: colors.muted,
                    fontSize: 11 }}>
                    💬 {post.comments?.length || 0}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
