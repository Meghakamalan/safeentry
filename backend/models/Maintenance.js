
import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema(
    {
        // Link the maintenance request to the resident.
        resident_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Type of maintenance issue.
        issue_type: {
            type: String,
            required: true,
        },

        // Description of the issue.
        description: {
            type: String,
            required: true,
        },

        // Date the request was submitted.
        request_date: {
            type: Date,
            default: Date.now,
        },

        // Current maintenance request status.
        status: {
            type: String,
            enum: [
                "Review",
                "Assign",
                "Resolved",

                // Older statuses kept for existing records.
                "Submitted",
                "In progress",
                "Resolved",
                "Closed",
                "submitted",
                "in progress",
                "resolved",
                "closed",
            ],
            default: "Review",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Maintenance", maintenanceSchema);
