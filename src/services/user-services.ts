import { Repository } from "typeorm";
import bcrypt from "bcrypt";
import { User } from "../entity/User";
import { UserData } from "../types";
import createHttpError from "http-errors";
import { ROLES } from "../constants";

export class UserService {
    constructor(private readonly userRepository: Repository<User>) {}

    create = async (userData: UserData) => {
        const user = await this.userRepository.findOne({
            where: { email: userData.email },
        });

        if (user) {
            const error = createHttpError(400, "EmailId already exists");
            throw error;
        }

        const { firstName, lastName, email } = userData;

        //hash the password
        const hashedPassword = await bcrypt.hash(userData.password, 10);
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
}
