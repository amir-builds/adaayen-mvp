import api from "./api";

export const getAllFabrics = async (page = 1, limit = 20) => {
  const { data } = await api.get(`/fabrics?page=${page}&limit=${limit}`);
  return data;
};
