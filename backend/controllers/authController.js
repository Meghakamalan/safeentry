const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//Register
const register = async (req, res) => {
    try{
        const {name, email,password} = req.body;
        const existingUser = await User.findOne({ email});
        if (exixtingUser){
            return res.status(400).json({
                message: "User already exists",
            });
        }
        const harshedPassword = await bcrypt.hash(password,10);

        const user = await User.create({
            name,
            email,
            password: harshedPassword,
        });

        res.status(201).json({
            message: " Registration Successful !",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }catch(error){
        res.status(500).json({
            message: "Server error",
        });
    }
};

//login


const login = async(req, res) => {
    try{
        const { email, password } = req.body;
        const user = await User.findOne({ email});

        if (!user){
            return res.status(401).json({
                message: " Invalid email or password",
            });
        }
        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );
        
        if(!passwordMatch){
            return res.status(401).json({
                message: "Invalid email or password !",
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn:"1h",
            }
        );

        res.cookie("token", token,{
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 *1000,
        });

        res.json({
            message: "Login Successful !",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }catch (error){
        res.status(500).json({
            message: "Server Error !",
        });
    }
};

//Logout

const logout = (req,res) => {
    res.clearCookie("token");
    res.json({
        message: "Logout Successful !",
    });
};

module.exports = {
    register,
    login,
    logout,
};
