export interface JwtGenerator {
    generate(payload: string): Promise<string> | string;
}
