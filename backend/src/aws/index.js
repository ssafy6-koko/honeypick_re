const aws = require('aws-sdk')
const { AWS_SECRET_KEY, AWS_ACCESS_KEY, AWS_REGION_KEY, AWS_BUCKET_NAME } = process.env

const s3 = new aws.S3({
  secretAccessKey: AWS_SECRET_KEY,
  accessKeyId: AWS_ACCESS_KEY,
  region: AWS_REGION_KEY,
})

const getSignedUrl = ({ key }) => {
  return new Promise((resolve, reject) => {
    s3.createPresignedPost(
      {
        Bucket: AWS_BUCKET_NAME,
        Fields: {
          key,
        },
        Expires: 300,
        Conditions: [
          // 50mb
          ["content-length-range", 0, 50 * 1000 * 1000],
          ["starts-with", "$Content-Type", "image/"],
        ],
      },
      (err, data) => {
        if (err) reject(err);
        resolve(data);
      }
    );
  });
};

module.exports = { s3, getSignedUrl }