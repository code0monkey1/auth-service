import bcrypt from "bcrypt";
import { HashComparer } from "../application/interfaces/cryptography/HashComparer";
import { HashGenerator } from "../application/interfaces/cryptography/HashGenerator";
export class EncryptionService implements HashComparer, HashGenerator {
    private readonly SALT_ROUNDS = 10;

    compare = async (
        plainText: string,
        hashedText: string,
    ): Promise<boolean> => {
        return await bcrypt.compare(plainText, hashedText);
    };
    generateHash = async (plainText: string): Promise<string> => {
        return await bcrypt.hash(plainText, this.SALT_ROUNDS);
    };
}
