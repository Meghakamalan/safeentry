import mongoose from "mongoose";
const maintenanceSchema = new mongoose.Schema(
    {
        //link maintenance log to logged in resident
        resident_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        issue_type: {
            type: String,
            required: true,
        },
        description: { 
            type: String,
            required: true,
        },
        date: {
            type: String,//formated date string
            required: true,
        },
        status: {
            type: String,
            enum: ["Submitted", "In progress", "Resolved", "Closed", "submitted", "in progress", "resolved", "closed"],
            default: "Submitted", //default status
        },
    },
    { timestamps: true }
);
export default mongoose.model("Maintenance", maintenanceSchema);