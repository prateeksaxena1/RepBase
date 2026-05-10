import { supabase } from './supabase';

// ─── PROFILES ────────────────────────
export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
};

export const updateProfile = async (userId, updates) => {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  if (error) throw error;
};

export const searchProfiles = async (query) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', `%${query}%`)
    .limit(20);
  if (error) throw error;
  return data || [];
};

// ─── FOLLOWS ─────────────────────────
export const followUser = async (followingId) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase
    .from('follows')
    .insert({ follower_id: user.id, following_id: followingId });
  if (error) throw error;
};

export const unfollowUser = async (followingId) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', followingId);
  if (error) throw error;
};

export const isFollowing = async (followingId) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', followingId)
    .single();
  return !!data;
};

export const getFollowerCount = async (userId) => {
  const { count } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', userId);
  return count || 0;
};

export const getFollowingCount = async (userId) => {
  const { count } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', userId);
  return count || 0;
};

// ─── POSTS ───────────────────────────
export const createPost = async (sessionId, caption) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('workout_posts')
    .insert({
      user_id: user.id,
      session_id: sessionId,
      caption,
      is_public: true,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deletePost = async (postId) => {
  const { error } = await supabase
    .from('workout_posts')
    .delete()
    .eq('id', postId);
  if (error) throw error;
};

// Helper: enrich posts with profile, session, likes, comments data
const enrichPosts = async (posts) => {
  if (!posts || posts.length === 0) return [];

  const userIds = [...new Set(posts.map((p) => p.user_id))];
  const sessionIds = [...new Set(posts.map((p) => p.session_id).filter(Boolean))];
  const postIds = posts.map((p) => p.id);

  // Fetch profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .in('id', userIds);

  // Fetch sessions
  let sessions = [];
  if (sessionIds.length > 0) {
    const { data: sessData } = await supabase
      .from('sessions')
      .select('id, date, duration_secs')
      .in('id', sessionIds);
    sessions = sessData || [];

    // Fetch session_sets for those sessions
    const { data: setsData } = await supabase
      .from('session_sets')
      .select('session_id, exercise_id, weight_kg, reps, set_type')
      .in('session_id', sessionIds);

    // Attach sets to sessions
    for (const s of sessions) {
      s.session_sets = (setsData || []).filter((set) => set.session_id === s.id);
    }
  }

  // Fetch likes
  const { data: likes } = await supabase
    .from('likes')
    .select('post_id, user_id')
    .in('post_id', postIds);

  // Fetch comments
  const { data: comments } = await supabase
    .from('comments')
    .select('id, post_id')
    .in('post_id', postIds);

  // Build lookup maps
  const profileMap = {};
  (profiles || []).forEach((p) => { profileMap[p.id] = p; });
  const sessionMap = {};
  sessions.forEach((s) => { sessionMap[s.id] = s; });

  // Enrich posts
  return posts.map((post) => ({
    ...post,
    profiles: profileMap[post.user_id] || null,
    sessions: post.session_id ? (sessionMap[post.session_id] || null) : null,
    likes: (likes || []).filter((l) => l.post_id === post.id),
    comments: (comments || []).filter((c) => c.post_id === post.id),
  }));
};

export const getFeed = async (limit = 20, offset = 0) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    // Get IDs of people current user follows
    const { data: follows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id);

    const followingIds = (follows || []).map((f) => f.following_id);
    followingIds.push(user.id); // include own posts

    const { data, error } = await supabase
      .from('workout_posts')
      .select('*')
      .in('user_id', followingIds)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return await enrichPosts(data || []);
  } catch (e) {
    console.warn('[Social] getFeed unavailable:', e.message || e.code);
    return [];
  }
};

export const getPublicFeed = async (limit = 20, offset = 0) => {
  try {
    const { data, error } = await supabase
      .from('workout_posts')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return await enrichPosts(data || []);
  } catch (e) {
    console.warn('[Social] getPublicFeed unavailable:', e.message || e.code);
    return [];
  }
};

export const getUserPosts = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('workout_posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return await enrichPosts(data || []);
  } catch (e) {
    console.warn('[Social] getUserPosts unavailable:', e.message || e.code);
    return [];
  }
};

// ─── LIKES ───────────────────────────
export const likePost = async (postId) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase
    .from('likes')
    .insert({ user_id: user.id, post_id: postId });
  if (error && error.code !== '23505') throw error;
};

export const unlikePost = async (postId) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('user_id', user.id)
    .eq('post_id', postId);
  if (error) throw error;
};

// ─── COMMENTS ────────────────────────
export const getComments = async (postId) => {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  if (error) throw error;

  // Fetch profiles for commenters
  const comments = data || [];
  if (comments.length === 0) return [];
  const userIds = [...new Set(comments.map((c) => c.user_id))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .in('id', userIds);
  const profileMap = {};
  (profiles || []).forEach((p) => { profileMap[p.id] = p; });
  return comments.map((c) => ({ ...c, profiles: profileMap[c.user_id] || null }));
};

export const addComment = async (postId, content) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase
    .from('comments')
    .insert({ user_id: user.id, post_id: postId, content });
  if (error) throw error;
};

export const deleteComment = async (commentId) => {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);
  if (error) throw error;
};
