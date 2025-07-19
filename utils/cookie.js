export const setCookie = (res, title, token, maxAge = 3600000) => {
  if (!res || !title || !token) return null;
  return res.cookie(title, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge,
  });
};

export const clearCookie = (res, title) => {
  if (!res || !title) return null;
  res.clearCookie(title, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
  });
};
