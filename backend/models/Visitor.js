import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema(
  {
    // Link visitor record to the resident's account
    resident_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Resident's unit number
    unit_number: {
      type: String,
      required: true,
      trim: true,
    },

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

    expected_date: {
      type: Date,
      required: true,
    },

    expected_time: {
      type: String,
      required: true,
    },

    vehicle_info: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Checked-In",
        "Checked-Out",
        "Cancelled",
      ],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Visitor", visitorSchema);
