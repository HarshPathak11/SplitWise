import { Terms, User } from "../models/schema.js";

// Create a new draft term
export const createTermDraft = async (req, res) => {
  try {
    const { version, content, type = "terms" } = req.body;

    if (!version || !content) {
      return res.status(400).json({ message: "Version and content are required" });
    }

    const existingTerm = await Terms.findOne({ version, type });
    if (existingTerm) {
      return res.status(409).json({ message: "Version already exists for this type" });
    }

    const newTerm = await Terms.create({
      version,
      content,
      type,
      status: "draft",
      isActive: false,
    });

    res.status(201).json({ message: "Draft term created successfully", term: newTerm });
  } catch (error) {
    console.error("Error creating draft term:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Publish a term (and archive the old one)
export const publishTerm = async (req, res) => {
  try {
    const { termId } = req.body;

    if (!termId) {
      return res.status(400).json({ message: "Term ID is required" });
    }

    const termToPublish = await Terms.findById(termId);
    if (!termToPublish) {
      return res.status(404).json({ message: "Term not found" });
    }

    // Archive currently active term OF THE SAME TYPE
    await Terms.updateMany(
      { isActive: true, type: termToPublish.type },
      { $set: { isActive: false, status: "archived" } }
    );

    // Publish new term
    termToPublish.isActive = true;
    termToPublish.status = "published";
    await termToPublish.save();

    res.status(200).json({ message: "Term published successfully", term: termToPublish });
  } catch (error) {
    console.error("Error publishing term:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get the currently active term
export const getActiveTerm = async (req, res) => {
  try {
    const { type = "terms" } = req.query;
    const activeTerm = await Terms.findOne({ isActive: true, type });
    if (!activeTerm) {
      return res.status(404).json({ message: "No active terms found" });
    }
    res.status(200).json({ term: activeTerm });
  } catch (error) {
    console.error("Error fetching active term:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all terms (admin view)
export const getAllTerms = async (req, res) => {
  try {
    const allTerms = await Terms.find().sort({ createdAt: -1 });
    res.status(200).json({ terms: allTerms });
  } catch (error) {
    console.error("Error fetching all terms:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// Check if user needs to sign active terms
export const checkTermsStatus = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware

    // 1. Get ALL active terms (both 'terms' and 'privacy')
    const activeDocs = await Terms.find({ isActive: true });

    if (!activeDocs || activeDocs.length === 0) {
      return res.status(200).json({ mustSign: false });
    }

    // 2. Get the user's agreements
    const user = await User.findById(userId).select("legalAgreements");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3. Map all active documents to include 'hasAgreed' status
    const termsStatus = activeDocs.map((doc) => {
      const hasAgreed = user.legalAgreements && user.legalAgreements.some(
        (agreement) => agreement.termsId.toString() === doc._id.toString()
      );
      // Return a plain object with the doc fields + hasAgreed
      return {
        ...doc.toObject(),
        hasAgreed
      };
    });

    // 4. Determine if user must sign any
    const mustSign = termsStatus.some(t => !t.hasAgreed);

    if (!mustSign) {
      return res.status(200).json({ mustSign: false });
    }

    // 5. Return ALL terms (so frontend can show tabs for all)
    return res.status(200).json({
      mustSign: true,
      terms: termsStatus,
    });
  } catch (error) {
    console.error("Error checking terms status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Record user agreement
export const acceptTerms = async (req, res) => {
  try {
    const userId = req.user.id;
    const { termId } = req.body;

    if (!termId) {
      return res.status(400).json({ message: "Term ID is required" });
    }

    const term = await Terms.findById(termId);
    if (!term) {
      return res.status(404).json({ message: "Term not found" });
    }

    // Update user's agreements array
    // Use $addToSet to prevent duplicate entries for the same term
    // Update user's agreements array
    await User.findByIdAndUpdate(userId, {
      $addToSet: {
        legalAgreements: {
          version: term.version,
          termsId: term._id,
          agreedAt: new Date(),
        },
      },
    });

    // Check if user has now agreed to ALL active terms
    const activeTerms = await Terms.find({ isActive: true });
    // Fetch updated user
    const updatedUser = await User.findById(userId).select("legalAgreements");
    
    const allAgreed = activeTerms.every(activeDoc => 
        updatedUser.legalAgreements.some(ua => ua.termsId.toString() === activeDoc._id.toString())
    );

    if (allAgreed) {
        await User.findByIdAndUpdate(userId, { agreedToTerms: true }); 
    }

    res.status(200).json({ message: "Terms accepted successfully" });
  } catch (error) {
    console.error("Error agreeing to terms:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};