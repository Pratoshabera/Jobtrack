const Job = require("../models/Job");


// Create Job
exports.createJob = async (req, res) => {
  try {
    const { title, company, status } = req.body;

    // VALIDATION
    if (!title || !company) {
      return res.status(400).json({ message: "Title and company are required" });
    }

    const validStatus = ["Applied", "Interview", "Offer", "Rejected"];

    if (status && !validStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const job = await Job.create({
      title,
      company,
      status,
      user: req.user.id,
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Jobs (filter + pagination)
exports.getJobs = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const query = { user: req.user.id };

    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: "i" };
    }

    if (req.query.status) {
      query.status =
        req.query.status.charAt(0).toUpperCase() +
        req.query.status.slice(1).toLowerCase();
    }

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalJobs = await Job.countDocuments(query);

    res.json({
      jobs,
      totalJobs,
      currentPage: page,
      totalPages: Math.ceil(totalJobs / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Job
exports.updateJob = async (req, res) => {
  try {
    const { title, company, status } = req.body;

    if (!title && !company && !status) {
      return res.status(400).json({ message: "At least one field required to update" });
    }

    const validStatus = ["Applied", "Interview", "Offer", "Rejected"];

    if (status && !validStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Job
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json({ message: "Job deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
