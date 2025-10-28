import api from "./api";

export const getAllFabrics = async () => {
  const { data } = await api.get("/fabrics");
  return data;
};
