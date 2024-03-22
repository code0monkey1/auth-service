export type AuthCookie = {
    accessToken: string;
    refreshToken: string;
};
export type RefreshTokenPayload = {
    id: string;
    userId: string;
};
