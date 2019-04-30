const config = require("config");
const jwt = require("jsonwebtoken");

function checkAuth(req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) res.status(401).json({ msg: "No token, authorization denied!" });

  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));
    req.user = decoded;
    console.log(req.user);
    next();
  } catch (e) {
    res.status(400).json({ msg: "Token is not valid!" });
  }
}

module.exports = checkAuth;