const Journal = require("../models/journalSchema");
const { uploadOnCloudinary } = require("../utils/cloudinary");

const addJournal = async (req, res) => {
  const { content } = req.body;

  const userId = req.user._id;

  let images = [];

  if (
    req.files &&
    Array.isArray(req.files.images) &&
    req.files.images.length > 0
  ) {
    for (const image of req.files.images) {
      try {
        const result = await uploadOnCloudinary(image.path);
        images.push(result?.secure_url);
      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          message: "Failed to upload images",
          error: uploadError.message,
        });
      }
    }
  }

  try {
    const journal = await Journal.create({
      userId: userId,
      content: content,
      images: images,
    });
    res.status(200).json({
      success: true,
      message: "Journal added successfully",
      journal: journal,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateJournal = async (req, res) => {
  const journalId = req.params.id;
  
  const { content } = req.body;

  const images = [];

  if (
    req.files &&
    Array.isArray(req.files.images) &&
    req.files.images.length > 0
  ) {
    for (const image of req.files.images) {
      try {
        const result = await uploadOnCloudinary(image.path);
        images.push(result.secure_url);
      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          message: "Failed to upload images",
          error: uploadError.message,
        });
      }
    }
  }

  try {
    const journal = await Journal.findByIdAndUpdate(
      journalId,
      { 
        content: content,
        images: images 
      },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Journal updated successfully",
      journal: journal,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteJournal = async (req, res) => {
  const journalId = req.params.id;

  try {
    const journal = await Journal.findByIdAndDelete(journalId);
    res.status(200).json({
      success: true,
      message: "Journal deleted successfully",
      journal: journal,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllJournals = async (req, res) => {
  const userId = req.user.id;

  try {
    const journals = await Journal.find({ userId: userId });
    res.status(200).json({
      success: true,
      message: "Journals fetched successfully",
      journals: journals,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getOneJournal = async (req, res) => {
  const journalId = req.params.id;

  try {
    const journal = await Journal.findById(journalId);
    res.status(200).json({
      success: true,
      message: "Journal fetched successfully",
      journal: journal,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getTodayJournal = async (req, res) => {
  const userId = req.user.id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  today.toISOString();

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  endOfDay.toISOString();

  try {
    const journal = await Journal.findOne({
      userId: userId,
      createdAt: { $gte: today, $lte: endOfDay },
    });

    if (!journal) {
      return res.status(404).json({
        success: false,
        message: "No journal entry found for today",
      });
    }

    res.status(200).json({
      success: true,
      message: "Journal fetched successfully",
      journal: journal,
    });
  } catch (error) {
    console.error("Error fetching today's journal:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  addJournal,
  updateJournal,
  getAllJournals,
  getOneJournal,
  deleteJournal,
  getTodayJournal,
};
