import cloudinary from "../utils/cloudinary.js";
import fs from "fs";



export const ProfilePhotoUpload =  async (req, res) => {
  try {
    const filePath = req.file.path;

    const result = await cloudinary.uploader.upload(filePath, {
      folder: "Profile Photo", // optional
    });

    fs.unlinkSync(filePath);

    return res.status(200).json({
      message: "File uploaded successfully",
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "File upload failed" });
  }
};

