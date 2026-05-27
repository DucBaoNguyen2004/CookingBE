import UserPreference from "../models/UserPreference.js";
import User from "../models/User.js";

export const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        const preferences = await UserPreference.findByUserId(req.user.id);       
        res.json({
            success: true,
            data: { user,preferences }
        });
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req, res, next) => {
    try {
        const { name, email } = req.body;
        const user = await User.update(req.user.id, { name, email });
        res.json({
            success: true,
            message:"Profile updated successfully",
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

export const updatePreferences = async (req, res, next) => {
    try {
        const preferences = await UserPreference.upsert(req.user.id, req.body);
        res.json({
            success: true,
            message: "Preferences updated successfully",
            data: { preferences }
        });
    } catch (error) {
        next(error);
    }
};

export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if(!currentPassword || !newPassword){
            return res.status(400).json({
                success: false,
                message: "Please provide current password and new password"
            });
        }
        const user = await User.findById(req.user.id);
        const isPasswordValid = await User.verifyPassword(currentPassword, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        await User.updatePassword(req.user.id, newPassword);
        res.json({
            success: true,
            message: "Password changed successfully"
        });
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req,res,next)=>{
    try{
    await User.delete(req.user.id);
    res.json({
        success: true,
        message: "User deleted successfully"
    });
}
catch(error){
    next(error);
}    
}