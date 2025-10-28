import api from "./api";

export const getFeaturedPosts = async () => {
  const { data } = await api.get("/posts?featured=true");
  return data;
};
