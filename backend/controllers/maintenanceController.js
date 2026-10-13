import Maintenance from "../models/Maintenance.js";

// GET fetch all maintenance requests registered by the logged-in resident
export const getMaintenanceRequest = async (req , res) =>{
    try{
        const residentId = req.user?.id || req.user?._id;
        const requests = await Maintenance.find({resident_id : residentId}).sort({createdAt: -1});
        res.json(requests);
    }catch(error){
        console.error("Get Maintenance Error:", error);
        res.status(500).json({message: error.message || "Error fetching maintenance requests"});

    }   
};
// POST creating a new maintenance request
export const createMaintenanceRequest = async(req,res)=>{
    try{
        const residentId = req.user?.id || req.user?._id;
        if(!residentId){
            return res.status(401).json({message: "user not authenticated"});

        }
        const {issue_type, description, request_date} = req.body;
        if(!issue_type || !description){
            return res.status(400).json({message: "Issue type and description are required"});
        }
        const newTicket = await Maintenance.create({
            resident_id: residentId,
            issue_type,
            description,
            request_date: request_date ? new Date(request_date) : new Date(),//convert input data to JS Date object
            status: "Submitted",//default status
        });
       
        res.status(201).json({
            message: "Maintenance request created successfully",
            request: newTicket,
        });
    }catch(error){
        console.error("Create Maintenance Error:", error);
        res.status(500).json({message: error.message || "Error creating maintenance request"});


    };
}