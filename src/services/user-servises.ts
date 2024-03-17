import { Repository } from "typeorm";

import { User } from "../entity/User";
import { UserData } from "../types";

export class UserService {
    constructor(private readonly userRepository: Repository<User>) {}

    create = async (userData: UserData) => {
        await this.userRepository.save(userData);
    };
}
