import api, { unwrapData } from './api';

export const getWardrobeProfile = async () => {
  const response = await api.get('/app/wardrobe/profile');
  return unwrapData<any>(response);
};

export const upsertWardrobeProfile = async (profile: any) => {
  const response = await api.post('/app/wardrobe/profile', {
    ...profile,
  });
  return unwrapData<any>(response);
};

export const getExploreFeed = async () => {
  const response = await api.get('/app/wardrobe/explore');
  return unwrapData<any>(response);
};

export const scoreChallenge = async (payload: any) => {
  const response = await api.post('/app/wardrobe/challenge/score', {
    ...payload,
  });
  return unwrapData<any>(response);
};

export const getWardrobeReport = async () => {
  const response = await api.get('/app/wardrobe/report');
  return unwrapData<any>(response);
};

export const healthCheck = async () => {
  const response = await api.get('/app/wardrobe/health');
  return unwrapData<any>(response);
};
