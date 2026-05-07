import { View, Text, ScrollView, TextInput,
  TouchableOpacity, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { getComments, addComment,
  deleteComment } from '../../../lib/social';
import useAuthStore from '../../../store/useAuthStore';
import { colors, font, radius } from '../../../constants/theme';

export default function PostDetail() {
  const { id } = useLocalSearchParams();
  const { user } = useAuthStore();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const loadComments = async () => {
    try {
      const data = await getComments(id);
      setComments(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadComments(); }, []);

  const handlePost = async () => {
    if (!text.trim()) return;
    setPosting(true);
    try {
      await addComment(id, text.trim());
      setText('');
      loadComments();
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setPosting(false); }
  };

  const handleDelete = (commentId) => {
    Alert.alert('Delete comment?', '', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive',
        onPress: async () => {
          await deleteComment(commentId);
          loadComments();
        }
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>

        {/* Header */}
        <View style={{ flexDirection: 'row',
          alignItems: 'center', padding: 20,
          paddingBottom: 10 }}>
          <TouchableOpacity onPress={() => router.back()}
            style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back"
              size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={{ color: colors.white, fontSize: 20,
            fontWeight: '900' }}>Comments</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.accent}
            style={{ marginTop: 40 }} />
        ) : (
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            {comments.length === 0 ? (
              <View style={{ alignItems: 'center',
                paddingTop: 40 }}>
                <Ionicons name="chatbubble-outline"
                  size={40} color={colors.dim} />
                <Text style={{ color: colors.muted,
                  fontSize: font.md, marginTop: 12 }}>
                  No comments yet. Be first!
                </Text>
              </View>
            ) : (
              comments.map((c) => (
                <View key={c.id} style={{
                  backgroundColor: colors.surface,
                  borderRadius: radius.card, padding: 14,
                  marginBottom: 10, borderWidth: 1,
                  borderColor: colors.border }}>
                  <View style={{ flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 6 }}>
                    <Text style={{ color: colors.accent,
                      fontSize: font.sm,
                      fontWeight: '800' }}>
                      @{c.profiles?.username}
                    </Text>
                    {c.user_id === user?.id && (
                      <TouchableOpacity
                        onPress={() => handleDelete(c.id)}>
                        <Ionicons name="trash-outline"
                          size={16} color={colors.dim} />
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={{ color: colors.white,
                    fontSize: font.md,
                    lineHeight: 20 }}>{c.content}</Text>
                </View>
              ))
            )}
          </ScrollView>
        )}

        {/* Comment input */}
        <View style={{ padding: 16, borderTopWidth: 1,
          borderTopColor: colors.border,
          flexDirection: 'row', gap: 10,
          alignItems: 'center' }}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Add a comment..."
            placeholderTextColor={colors.dim}
            style={{ flex: 1, backgroundColor: colors.surface,
              color: colors.white, borderRadius: radius.input,
              padding: 12, fontSize: font.md,
              borderWidth: 1, borderColor: colors.border }}
          />
          <TouchableOpacity onPress={handlePost}
            disabled={posting || !text.trim()}
            style={{ backgroundColor: text.trim()
              ? colors.accent : colors.dim,
              borderRadius: 10, padding: 12 }}>
            <Ionicons name="send" size={18}
              color={text.trim() ? '#0D0D0D' : '#666'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
