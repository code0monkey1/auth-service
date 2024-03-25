export interface HashGenerator {
    generateHash: (plainText: string) => Promise<string> | string;
}
