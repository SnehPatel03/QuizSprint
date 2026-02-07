import jwt from "jsonwebtoken";
const generateTokenAndSaveInCookies = (user, res) => {
    console.log("users role", user);
    const token = jwt.sign({
        id: user.id,
        role: user.role,
    }, process.env.JWT_SECRET || "snehpateljwt123", { expiresIn: "10d" });
    res.cookie("jwt", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
        maxAge: 10 * 24 * 60 * 60 * 1000,
    });
    console.log("VERIFY TOKEN:", token);
    console.log("JWT SECRET:", process.env.JWT_SECRET);
    return token;
};
export default generateTokenAndSaveInCookies;
