import { Repository } from "typeorm";
import { User } from "../entity/User";
import { UserData } from "../types";
import createHttpError from "http-errors";
import { ROLES } from "../constants";
import { EncryptionService } from "./encryption-service";

export class UserService {
    constructor(
        private readonly userRepository: Repository<User>,
        private readonly encryptionService: EncryptionService,
    ) {}

    create = async (userData: UserData) => {
        const user = await this.userRepository.findOne({
            where: { email: userData.email },
        });

        if (user) {
            const error = createHttpError(400, "EmailId already exists");
            throw error;
        }

        const { firstName, lastName, email } = userData;

        const hashedPassword = await this.encryptionService.getEncryptedHash(
            userData.password,
        );

        try {
            const user = await this.userRepository.save({
                firstName,
                lastName,
                email,
                role: ROLES.CUSTOMER,
                hashedPassword,
            });

            return user as User & { id: string };
        } catch (e) {
            const error = createHttpError(
                500,
                "failed to store the dat in the database",
            );

            throw error;
        }
    };

    findByEmailAndPassword = async (email: string, password: string) => {
        const user = await this.userRepository.findOne({
            where: { email },
        });

        const isValidUser =
            user &&
            (await this.encryptionService.verify(
                password,
                user.hashedPassword,
            ));

        if (!(isValidUser && user)) {
            const error = createHttpError(
                400,
                "Email or Password does not match",
            );
            throw error;
        }

        return user as User & { id: string };
    };
}
