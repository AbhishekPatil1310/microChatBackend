import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  try {
    // 1️⃣ Get token from cookies
    const token = req.cookies?.accessToken;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // 2️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3️⃣ Attach user info to request
    req.user = decoded;
    next();
  } catch (err) {
    // 4️⃣ Handle expired or invalid token
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Unauthorized" });
  }
};
