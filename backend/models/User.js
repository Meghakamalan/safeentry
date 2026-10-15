import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        first_name: {
            type: String,
            required: true,
            trim: true,
        },

        last_name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        phone: {
            type: String,
            required: true,
            trim: true,
        },

        // Unit number is optional
        unit_number: {
            type: String,
            trim: true,
            default: "",
        },

        password: {
            type: String,
            required: true,
        },

        role: {
            type: String,
            enum: ["Resident", "Guard", "Admin"],
            default: "Resident",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("User", userSchema);
