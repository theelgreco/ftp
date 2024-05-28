const jwt = require("jsonwebtoken")
const {UnauthorisedError, ForbiddenError} = require("../errors/classes");

exports.authenticateJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    try {
        if (!token) {
            throw new UnauthorisedError("No JWT provided")
        }

        jwt.verify(token, process.env.JWT_KEY, (err, user) => {
            if (err) {
                throw new UnauthorisedError("Invalid JWT provided")
            }

            console.log(user)

            req.user = user;
            next();
        });
    } catch (error) {
        next(error)
    }
}