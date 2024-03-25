import bcrypt from "bcrypt";
import { HashComparer } from "../application/interfaces/cryptography/HashComparer";
import { HashGenerator } from "../application/interfaces/cryptography/HashGenerator";
export class EncryptionService implements HashComparer, HashGenerator {
    private readonly SALT_ROUNDS = 10;
    async compare(plainText: string, hashedText: string): Promise<boolean> {
        return await bcrypt.compare(plainText, hashedText);
    }
    generateHash = async (plainText: string): Promise<string> => {
        return await bcrypt.hash(plainText, this.SALT_ROUNDS);
    };

    getEncryptedHash = async (
        data: string,
        saltRounds = 10,
    ): Promise<string> => {
        return await bcrypt.hash(data, saltRounds);
    };

    verify = async (
        plainData: string,
        encryptedData: string,
    ): Promise<boolean> => {
        return await bcrypt.compare(plainData, encryptedData);
    };
}
