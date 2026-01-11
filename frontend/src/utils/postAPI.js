import api from "./api";

export const getFeaturedPosts = async (page = 1, limit = 10) => {
  const { data } = await api.get(`/posts/featured?page=${page}&limit=${limit}`);
  return data;
};

export const getAllPosts = async (page = 1, limit = 20, filters = {}) => {
  const params = new URLSearchParams({ page, limit, ...filters });
  const { data } = await api.get(`/posts?${params.toString()}`);
  return data;
};

export const getPostsByCreator = async (creatorId, page = 1, limit = 20) => {
  const { data } = await api.get(`/posts/creator/${creatorId}?page=${page}&limit=${limit}`);
  return data;
};
