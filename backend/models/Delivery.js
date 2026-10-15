import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema(
    {
        resident_unit: {
            type: String,
            required: true,
            trim: true,
        },
        delivery_type: {
            type: String,
            required: true,
            enum: [
                "Package / Parcel",
                "Food Delivery",
                "Courier Service",
            ],
        },
        courier_name: {
            type: String,
            required: true,
            trim: true,
        },
        guard_name: {
            type: String,
            required: true,
            trim: true,
        },
        pickup_location: {
            type: String,
            required: true,
            enum: ["Security Desk", "Locker"],
        },
        logged_at: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Delivery", deliverySchema);
