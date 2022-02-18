
function isAuthenticated(req, res, next) {
    const token = req.headers['authorization'];
    if (token) {
        req.token = token;
        next();
    } else {
        res.sendStatus(401);
    }
}

module.exports = {
    isAuthenticated
};