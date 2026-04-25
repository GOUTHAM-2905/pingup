export const protect = (req, res, next) => {
    try {
        const { userId } = req.auth(); // ✅ no await

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Not Authenticated"
            });
        }

        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};