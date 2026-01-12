import jwt from "jsonwebtoken";

const authAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1]; // 👈 VERY IMPORTANT

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.admin = decoded; // optional
    next();
  } catch (error) {
    console.log("JWT ERROR:", error.message);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export default authAdmin;
