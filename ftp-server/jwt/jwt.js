exports.authenticateJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    try {
        if (!token) {
            throw new UnauthorisedError("No JWT provided")
        }

        jwt.verify(token, process.env.JWT_KEY, (err, user) => {
            if (err) {
                throw new ForbiddenError("Invalid JWT provided")
            }

            req.user = user;
            next();
        });
    } catch (error) {
        next(error)
    }
}