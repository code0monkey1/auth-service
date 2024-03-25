export interface JwtVerify {
    compare(jwt: string): Promise<string | null>;
}
