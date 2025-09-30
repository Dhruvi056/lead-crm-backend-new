const Lead = require("../model/lead");
const User = require("../model/users");

const getLeads = async (req, res) => {
  try {
    const { search, userId, status, page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const perPage = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));

    const filter = {
      $and: [
        {
          $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
        },
      ],
    };
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$and.push({
        $or: [{ email: regex }, { firstName: regex }],
      });
    }
    if (userId) {
      filter.$and.push({ userId });
    }

    if (status) {
      filter.$and.push({ status: status.toUpperCase() });
    }

    const currentUserId = req?.user?.userId;
    if (currentUserId) {
      const currentUser = await User.findById(currentUserId).select("role");
      if (currentUser && currentUser.role === "Admin") {
        filter.$and.push({ userId: currentUserId });
      }
    }

    const total = await Lead.countDocuments(filter);

    const leads = await Lead.find(filter)
      .sort({ createdDate: -1 })
      .skip((pageNum - 1) * perPage)
      .limit(perPage)
      .populate({
        path: "userId",
        select: "firstName email",
      });

    res.status(200).json({
      success: true,
      message: "Leads fetched successfully",
      data: leads,
      meta: {
        total,
        perPage,
        currentPage: pageNum,
        totalPages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    console.error("Error in getLeads:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    res.status(200).json({ success: true, data: lead });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to get lead", error: error.message });
  }
};


const createLead = async (req, res) => {
  try {
    const {
      email,
      firstName,
      websiteURL,
      linkdinURL,
      industry,
      whatsUpNumber,
      status,
      workEmail,
      userId,
      priority,
    } = req.body;


    if (!firstName) {
      return res.status(400).json({ success: false, message: "First Name is required" });
    }

    if (!whatsUpNumber) {
      return res.status(400).json({ success: false, message: "WhatsApp number is required" });
    }
    let emailArray = [];
    if (Array.isArray(email)) {
      emailArray = email.map((e) => (e && e.trim() !== "" ? e.trim() : null));
    } else if (email && email.trim() !== "") {
      emailArray = [email.trim()];
    }

    if (!emailArray[0]) {
      return res.status(400).json({ success: false, message: "Primary email is required" });
    }

    const leadByEmail = await Lead.findOne({ email: { $in: email } });
    if (leadByEmail) {
      return res.status(400).json({
        success: false,
        message: `Lead already exists with email: ${leadByEmail.email}`,
      });
    }

    const leadByWhatsAppNumber = await Lead.findOne({ whatsUpNumber });
    if (leadByWhatsAppNumber) {
      return res.status(400).json({
        success: false,
        message: "Lead with this WhatsApp number already exists",
      });
    }

    const currentUserId = req?.user?.userId;
    let assignedUserId = userId;
    if (currentUserId) {
      const currentUser = await User.findById(currentUserId).select("role");
      if (currentUser) {
        if (currentUser.role === "Admin") {
          assignedUserId = currentUserId;
        } else {
          assignedUserId = userId || currentUserId;
        }
      }
    }

    const newLead = await Lead.create({
      email,
      firstName,
      websiteURL: websiteURL || null,
      linkdinURL: linkdinURL || null,
      industry,
      whatsUpNumber,
      status,
      workEmail: workEmail || null,
      userId: assignedUserId,
      priority,
    });

    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: newLead,
    });
  } catch (error) {
    console.error("Error creating lead:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create lead",
      error: error.message,
    });
  }
};

const updateLead = async (req, res) => {
  try {
    const leadId = req.params.id;
    const {
      email,
      firstName,
      websiteURL,
      linkdinURL,
      industry,
      whatsUpNumber,
      status,
      workEmail,
      userId,
      priority,
    } = req.body;
 
    let emailArray = [];
    if (Array.isArray(email)) {
      emailArray = email.map((e) => (e && e.trim() !== "" ? e.trim() : null));
    } else if (email && email.trim() !== "") {
      emailArray = [email.trim()];
    }
 
    if (!emailArray[0]) {
      return res.status(400).json({
        success: false,
        message: "Primary email is required",
      });
    }
 
    emailArray = [emailArray[0], ...emailArray.slice(1).filter((e) => e)];
 
    const existingLead = await Lead.findOne({
      email: { $in: emailArray },
      _id: { $ne: leadId },
    });
 
    if (existingLead) {
      return res.status(400).json({
        success: false,
        message: `Email already exists with another lead: ${existingLead.email}`,
      });
    }
 
    if (whatsUpNumber) {
      const existingWhatsApp = await Lead.findOne({
        whatsUpNumber,
        _id: { $ne: leadId },
      });
 
      if (existingWhatsApp) {
        return res.status(400).json({
          success: false,
          message: "Lead with this WhatsApp number already exists",
        });
      }
    }
 
    const updateData = {
      email: emailArray,
      firstName,
      websiteURL: websiteURL || null,
      linkdinURL: linkdinURL || null,
      industry,
      whatsUpNumber,
      status,
      workEmail: workEmail || null,
      userId,
      priority,
      updatedDate: Date.now(),
    };
 
    const updatedLead = await Lead.findByIdAndUpdate(leadId, updateData, {
      new: true,
      runValidators: true,
    });
 
    if (!updatedLead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }
 
    res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      data: updatedLead,
    });
  } catch (error) {
    console.error("Error updating lead:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update lead",
      error: error.message,
    });
  }
};


const deleteLead = async (req, res) => {
  try {
    const leadId = req.params.id;

    const existingLead = await Lead.findById(leadId);

    if (!existingLead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    if (existingLead.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "Lead already deleted",
      });
    }

    const deletedLead = await Lead.findByIdAndUpdate(
      leadId,
      { isDeleted: true },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Lead soft deleted successfully",
      data: deletedLead,
    });
  } catch (error) {
    console.error("Error soft deleting lead:", error);
    res.status(500).json({
      success: false,
      message: "Failed to soft delete lead",
      error: error.message,
    });
  }
};

module.exports = {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
};
