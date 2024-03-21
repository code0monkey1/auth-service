export interface UserServiceInterface<Req, Res> {
    create(userData: Req): Promise<Error> | Promise<Res>;
    findByEmailAndPassword(
        email: string,
        password: string,
    ): Promise<Error> | Promise<Res>;
    findById(id: number): Promise<Res | null>;
}
