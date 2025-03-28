const { Storage } = require("@google-cloud/storage");
require("dotenv").config();

const storage = new Storage({ keyFilename: process.env.GCLOUD_KEYFILE });
const bucket = storage.bucket(process.env.GCLOUD_BUCKET);

const uploadToGCS = async (file) => {
    if (!file) return null;
    
    const { originalname, buffer } = file;
    const blob = bucket.file(`movies/${originalname}`);
    const blobStream = blob.createWriteStream();

    return new Promise((resolve, reject) => {
        blobStream.on("finish", async () => {
            await blob.makePublic();
            resolve(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);
        });

        blobStream.on("error", (err) => reject(err));
        blobStream.end(buffer);
    });
};

module.exports = { uploadToGCS };
