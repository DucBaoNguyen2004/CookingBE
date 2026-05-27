import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization")?.replace('Bearer ', '').trim();

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "No token, authorization denied"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            id: decoded.id,
            email: decoded.email
        };
        next();

    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Token is not valid"
        });
    }
};

export default authMiddleware;