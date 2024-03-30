import { checkSchema } from "express-validator";

export default checkSchema({
    email: {
        errorMessage: "email is missing",
        notEmpty: true,
        trim: true,
        isEmail: {
            errorMessage: "Email should be valid",
        },
    },
    password: {
        errorMessage: "password is missing",
        notEmpty: true,
        trim: true,
        isLength: {
            options: { min: 8 },
            errorMessage: "Password must be at least 8 characters long",
        },
    },
    lastName: {
        errorMessage: "lastName is missing",
        notEmpty: true,
    },
    firstName: {
        errorMessage: "firstName is missing",
        notEmpty: true,
    },
    role: {
        errorMessage: "role is missing",
        notEmpty: true,
    },
});
