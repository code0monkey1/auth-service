import { AppDataSource } from "../../config/data-source";
import { User } from "../../entity/User";
import { EncryptionService } from "../../services/encryption-service";
import { UserService } from "../../services/user-services";

export const createUserService = () => {
    const userRepository = AppDataSource.getRepository(User);
    const encryptionService = new EncryptionService();
    return new UserService(userRepository, encryptionService);
};
