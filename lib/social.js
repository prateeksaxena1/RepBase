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

export const getFeed = async (limit = 20, offset = 0) => {
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
    .select(`
      *,
      profiles:user_id (id, username, avatar_url),
      sessions:session_id (
        date, duration_secs,
        session_sets (exercise_id, weight_kg, reps, set_type)
      ),
      likes (user_id),
      comments (id)
    `)
    .in('user_id', followingIds)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data || [];
};

export const getPublicFeed = async (limit = 20, offset = 0) => {
  const { data, error } = await supabase
    .from('workout_posts')
    .select(`
      *,
      profiles:user_id (id, username, avatar_url),
      sessions:session_id (
        date, duration_secs,
        session_sets (exercise_id, weight_kg, reps, set_type)
      ),
      likes (user_id),
      comments (id)
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data || [];
};

export const getUserPosts = async (userId) => {
  const { data, error } = await supabase
    .from('workout_posts')
    .select(`
      *,
      profiles:user_id (id, username, avatar_url),
      sessions:session_id (date, duration_secs),
      likes (user_id),
      comments (id)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
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
    .select('*, profiles:user_id (username, avatar_url)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
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
