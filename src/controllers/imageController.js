const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const s3 = require("../config/s3");
const { v4: uuidv4 } = require("uuid");

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const file = req.file;
    const extension = file.originalname.split(".").pop();
    const key = `images/${uuidv4()}.${extension}`;

    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      //   ACL: "public-read", // make image publicly accessible
    };

    // Upload to S3
    const parallelUploads3 = new Upload({
      client: s3,
      params: uploadParams,
    });

    await parallelUploads3.done();

    const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return res.status(200).json({
      success: true,
      url,
      message: "Image uploaded successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Upload failed" });
  }
};

module.exports = { uploadImage };
