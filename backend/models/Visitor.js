import mangoose from "mongoose";
const visitorSchema = new mangoose.Schema(
    {
        //link visitor log to logged in resident
        resident_id: {
            type: mangoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        first_name: {
            type: String,
            required: true,
        },
        last_name: {
            type: String,
            required: true,
        },
        expected_date: {
            type: String,//formated date atring
            required: true,
        },
        expected_time: {
            type: String,//formated time string
            required: true,
        },
        vehicle_info: {
            type: String,
            required: false,
        },
        status: {
            type: String,
            enum: ["pending", "CheckedIn", "CheckedOut", "Cancelled"],
            default: "pending", //default status
        },

    },
    { timestamps: true }
);
export default mangoose.model("Visitor", visitorSchema);