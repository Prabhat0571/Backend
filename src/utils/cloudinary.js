import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// ✅ Cloudinary Configuration (loads once when app starts)
cloudinary.config({
  cloud_name: 'backendcloudchai',
  api_key:'471864876179146',
  api_secret:'nJlWuvXHGSF-6qwr4H6NIejPlTk'
});

// ✅ Upload Function
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Upload to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
    });

    console.log("✅ Uploaded to Cloudinary:", response.url);
    return response;

  } catch (error) {
    console.error(" Cloudinary upload error:", error);

    // Cleanup local file if upload fails
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return null;
  }
};

export { uploadOnCloudinary };
