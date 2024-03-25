export interface JwtVerify {
    verify(jwt: string): Promise<string | null>;
}
