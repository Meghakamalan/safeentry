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

//PUT Update an existing visitor record
export const updateVisitor = async (req, res) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, expected_date, expected_time, vehicle_info } = req.body;

        //verify that the visitor belongs to the logged-in resident
        const visitor = await Visitor.findOne({ _id: id, resident_id: req.user.id });
        if (!visitor) {
            return res.status(404).json({ message: "Visitor record not found" });
        }

        visitor.first_name = first_name || visitor.first_name;
        visitor.last_name = last_name || visitor.last_name;
        visitor.expected_date = expected_date || visitor.expected_date;
        visitor.expected_time = expected_time || visitor.expected_time;
        visitor.vehicle_info = vehicle_info || visitor.vehicle_info;

        await visitor.save();

        res.json({
            message: "Visitor updated successfully",
            visitor,
        });
    } catch (error) {
        console.error("Update Visitor Error:", error);
        res.status(500).json({ message: "Error updating visitor" });

    }
};

//DELETE a visitor request
export const deleteVisitor = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedVisitor = await Visitor.findOneAndDelete({ _id: id, resident_id: req.user.id });
        if (!deletedVisitor) {
            return res.status(404).json({ message: "Visitor record not found" });
        }
        res.json({
            message: "Visitor deleted successfully" });
    } catch (error) {
        console.error("Delete Visitor Error:", error);
        res.status(500).json({ message: "Error deleting visitor" });
    }
};