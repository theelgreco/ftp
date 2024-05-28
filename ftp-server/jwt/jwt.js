const jwt = require("jsonwebtoken")
const {UnauthorisedError, ForbiddenError} = require("../errors/classes");
const {getUser, createUser} = require("../models/models");

exports.authenticateJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    try {
        if (!token) {
            throw new UnauthorisedError("No JWT provided")
        }

        jwt.verify(token, process.env.JWT_KEY, async (err, user) => {
            if (err) {
                throw new UnauthorisedError("Invalid JWT provided")
            }

            try {
                req.user = await getUser(user.user_id);

                if (!req.user) {
                    req.user = await createUser(user.user_id);
                }

                next();
            } catch (err) {
                next(err)
            }
        });
    } catch (error) {
        next(error)
    }
}