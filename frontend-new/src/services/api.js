import axios from 'axios';

const USER_API_URL = 'http://localhost:8081/api/users';
const WORKPLAN_API_URL = 'http://localhost:8081/api/workplans';
const POST_API_URL = 'http://localhost:8081/api/posts';
const LIKE_API_URL = 'http://localhost:8081/api/likes';
const COMMENT_API_URL = 'http://localhost:8081/api/comments';

// User-related functions
export const getUser = (id) => axios.get(`${USER_API_URL}/${id}`).then(res => res.data);
export const updateUser = (id, user) => axios.put(`${USER_API_URL}/${id}`, user).then(res => res.data);
export const deleteUser = (id) => axios.delete(`${USER_API_URL}/${id}`).then(() => {});
export const followUser = (followerId, followingId) => axios.post(`${USER_API_URL}/${followerId}/follow/${followingId}`).then(res => res.data);
export const unfollowUser = (followerId, followingId) => axios.post(`${USER_API_URL}/${followerId}/unfollow/${followingId}`).then(res => res.data);
export const getFollowers = (id) => axios.get(`${USER_API_URL}/${id}/followers`).then(res => res.data);
export const getFollowing = (id) => axios.get(`${USER_API_URL}/${id}/following`).then(res => res.data);
export const getAllUsers = () => axios.get(USER_API_URL).then(res => res.data);
export const loginUser = (credentials) => axios.post(`${USER_API_URL}/login`, credentials).then(res => res.data);
export const createUser = (userData) => axios.post(USER_API_URL, userData).then(res => res.data);

// Work plan functions
export const createWorkPlan = async (workPlan) => {
  const response = await axios.post(WORKPLAN_API_URL, workPlan);
  return response.data;
};

export const getWorkPlansByUser = async (userId) => {
  const response = await axios.get(WORKPLAN_API_URL, { params: { userId } });
  return response.data;
};

export const getWorkPlan = async (id) => {
  const response = await axios.get(`${WORKPLAN_API_URL}/${id}`);
  return response.data;
};

export const updateWorkPlan = async (id, workPlan) => {
  const response = await axios.put(`${WORKPLAN_API_URL}/${id}`, workPlan);
  return response.data;
};

export const deleteWorkPlan = async (id) => {
  await axios.delete(`${WORKPLAN_API_URL}/${id}`);
};

// Post functions
export const createPost = async (post) => {
  const response = await axios.post(POST_API_URL, post);
  return response.data;
};

export const getPostsByUserId = async (userId) => {
  const response = await axios.get(POST_API_URL, { params: { userId } });
  return response.data;
};

export const getAllPosts = async () => {
  const response = await axios.get(`${POST_API_URL}/all`);
  return response.data;
};

export const getPostById = async (id) => {
  const response = await axios.get(`${POST_API_URL}/${id}`);
  return response.data;
};

export const updatePost = async (id, post) => {
  const response = await axios.put(`${POST_API_URL}/${id}`, post);
  return response.data;
};

export const deletePost = async (id) => {
  await axios.delete(`${POST_API_URL}/${id}`);
};

// Like functions
export const createLike = async (userId, postId) => {
  const response = await axios.post(`${LIKE_API_URL}/user/${userId}/post/${postId}`);
  return response.data;
};

export const getLikesByPostId = async (postId) => {
  const response = await axios.get(`${LIKE_API_URL}/post/${postId}`);
  return response.data;
};

export const deleteLike = async (userId, postId) => {
  await axios.delete(`${LIKE_API_URL}/user/${userId}/post/${postId}`);
};

// Comment functions
export const createComment = async (userId, postId, content) => {
  const response = await axios.post(`${COMMENT_API_URL}/user/${userId}/post/${postId}`, { content });
  return response.data;
};

export const getCommentsByPostId = async (postId) => {
  const response = await axios.get(`${COMMENT_API_URL}/post/${postId}`);
  return response.data;
};

export const updateComment = async (commentId, content) => {
  const response = await axios.put(`${COMMENT_API_URL}/${commentId}`, { content });
  return response.data;
};

export const deleteComment = async (commentId) => {
  await axios.delete(`${COMMENT_API_URL}/${commentId}`);
};