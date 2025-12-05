let accessToken: string | null = null;

export const setAccessToken = (token: string) => {
  console.log("🚀 ~ setAccessToken ~ token:", token)
  accessToken = token;
};

export const getAccessToken = () => {
  return accessToken;
};

export const clearAccessToken = () => {
  accessToken = null;
};
