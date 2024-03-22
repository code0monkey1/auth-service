export interface UserServiceInterface<Req, Res> {
    create(userData: Req): Promise<Error> | Promise<Res>;
    findByEmailAndPassword(
        email: string,
        password: string,
    ): Promise<Res | Error>;
    findById(id: number): Promise<Res | null>;
}
