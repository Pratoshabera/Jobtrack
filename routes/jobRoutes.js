const express = require("express");
const Job = require("../models/Job");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

//Create job
router.post("/", protect, async(req, res)=>{
    try{
        const {title, company, status }= req.body;

        const job = await Job.create({
            title,
            company,
            status,
            user: req.user,
        });

        res.status(201).json(job);
    }catch (error){
        res.status(500).json({message: error.message});
    }
});

//GET all jobs for logged-in user
router.get("/", protect, async(req, res)=>{
    try{
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;
        const skip = (page -1) * limit;

        const query = { user: req.user};

        if (req.query.status) {
            query.status = req.query.status;
        }

        const jobs= await Job.find(query)
        .sort({ createdAt: -1})
        .skip(skip)
        .limit(limit);

        const totalJobs = await Job.countDocuments(query);

        res.json({
            totalJobs,
            CurrentPage: page,
            totalpages: Math.ceil(totalJobs /limit),
        });
    } catch(error){
        res.status(500).json({message: error.message});
    }
});


//UPDATE job
router.put("/:id", protect, async(req, res) => {
    try{
        const job = await Job.findOneAndUpdate(
            {_id: req.params.id, user: req.user},
            req.body,
            {new: true}
        );

        if (!job) {
            return res.status(404).json({message: "Job not found"});
        }

        res.json(job);
    }catch(error) {
        res.status(500).json({message: error.message});
    }
});


//Delete Job
router.delete("/:id", protect, async (req, res)=>{
    try{
        const job =await Job.findOneAndDelete({
            _id : req.params.id,
            user: req.user,
        });

        if (!job){
            return res.status(404).json({ message: "Jab not found" });
        }

        res.json({message: "job deleted" });
    } catch (error){
        res.status(500).json({message: error.message });
    }
});


module.exports = router;