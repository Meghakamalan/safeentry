import Visitor from "../models/Visitor.js";
//GET Fetch all visitors registered by the logged-in resident
export const getVisitors = async (req, res) => {
    try {
        const visitors = await Visitor.find({resident_id: req.user.id}).sort({ createdAt: -1 }); // Sort by most recent
        res.json(visitors);
    } catch (error) {
        console.error("Get Visitors Error:", error);
        res.status(500).json({ message: "Error fetching visitors" });
    }
};

//POST Create a new visitor record
export const createVisitor = async (req, res) => {
    try {
        const { first_name, last_name, expected_date, expected_time, vehicle_info } = req.body;
        const newVisitor = await Visitor.create({
            resident_id: req.user.id,
            first_name,
            last_name,
            expected_date,
            expected_time,
            vehicle_info,
            status: "Pending",// Default status
        });

        res.status(201).json({
            message: "Visitor created successfully",
            visitor: newVisitor,
        });
    } catch (error) {
        console.error("Create Visitor Error:", error);
        res.status(500).json({ message: "Error creating visitor" });
    }
};