import { Repository } from "typeorm";

import { User } from "../entity/User";
import { UserData } from "../types";
import createHttpError from "http-errors";
import { ROLES } from "../constants";

export class UserService {
    constructor(private readonly userRepository: Repository<User>) {}

    create = async (userData: UserData) => {
        try {
            await this.userRepository.save({
                ...userData,
                role: ROLES.CUSTOMER,
            });
        } catch (e) {
            const error = createHttpError(
                500,
                "failed to store the dat in the database",
            );

            throw error;
        }
    };
}
