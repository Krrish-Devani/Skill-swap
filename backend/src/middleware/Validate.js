import { joiUserSchema, joiLoginSchema } from '../lib/joiSchema.js';
import ExpressError from '../lib/ExpressError.js';

export const userValidate = (req, res, next) => {
    const { error } = joiUserSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error.details.map((el) => el.message.replace(/"/g, '')).join(', '));
    } else {
        next();
    }
};

export const loginValidate = (req, res, next) => {
    const { error } = joiLoginSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error.details.map((el) => el.message.replace(/"/g, '')).join(', '));
    } else {
        next();
    }
};