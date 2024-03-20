export const isBearerToken = (authHeader: string) => {
    return (
        authHeader &&
        authHeader.split(" ")[0] === "Bearer" &&
        authHeader.split(" ")[1] !== undefined
    );
};
