import bcrypt from "bcrypt";
export class EncryptionService {
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
