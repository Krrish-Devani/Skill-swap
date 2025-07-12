import joi from 'joi';

export const joiUserSchema = joi.object({
    email: joi.string().required(),
    fullName: joi.string().required(),
    password: joi.string().required().min(6),
    profilePic: joi.string().default("")
});

export const joiLoginSchema = joi.object({
    email: joi.string().required(),
    password: joi.string().required().min(6)
});