import { GetObjectCommand } from "@aws-sdk/client-s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { S3Client } from "@aws-sdk/client-s3";
import fs from "fs";

const s3Client = new S3Client({
  "region": process.env.AWS_REGION,
  "accessKeyId": process.env.AWS_ACCESS_KEY_ID,
  "secretAccessKey": process.env.AWS_SECRET_ACCESS_KEY
});

// Create a helper function to convert a ReadableStream to a string.
const streamToString = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });

const getConfig = async() => {
  const getBucketParams = { Bucket: process.env.AWS_BUCKET, Key: "hue/.config.json" };
  const data = await s3Client.send(new GetObjectCommand(getBucketParams));
  const bodyContents = await streamToString(data.Body);
  return  JSON.parse(bodyContents);
};

const putConfig = async(config) => {

  const putBucketParams = {Bucket: process.env.AWS_BUCKET, Key: "hue/.config.json", Body: JSON.stringify(config)};
  try {
    console.log("putting new auth data");
    console.log(config);
    s3Client.send(new PutObjectCommand(putBucketParams));
    return true;
  } catch(err) {
      console.log("Failed to Write Config");
      console.log("Config was: ");
      console.log(config);
      console.log("Error was: ");
      console.log(err);
      return false;
  }
};

export {getConfig, putConfig};

/*

const getAuthData = async () => {
  let rawdata = fs.readFileSync('.config.json');
  let authdata = JSON.parse(rawdata);
  return authdata;
};

let authdata = await getAuthData();

console.log(authdata);




await s3Client.send(new PutObjectCommand(putBucketParams));
*/


/*
// Import required AWS SDK clients and commands for Node.js
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "./libs/s3Client.js"; // Helper function that creates Amazon S3 service client module.

// Set the parameters.
export const bucketParams = {
  Bucket: "BUCKET_NAME",
  // Specify the name of the new object. For example, 'index.html'.
  // To create a directory for the object, use '/'. For example, 'myApp/package.json'.
  Key: "OBJECT_NAME",
  // Content of the new object.
  Body: "BODY",
};

// Create and upload the object to the specified Amazon S3 bucket.
export const run = async () => {
  try {
    const data = await s3Client.send(new PutObjectCommand(bucketParams));
    return data; // For unit tests.
    console.log(
      "Successfully uploaded object: " +
        bucketParams.Bucket +
        "/" +
        bucketParams.Key
    );
  } catch (err) {
    console.log("Error", err);
  }
};

*/


//import AWS from 'aws-sdk'

// const s3 = new AWS.S3({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID, // /* required */ # Put your iam user key
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,// /* required */  # Put your iam user secret key
//   Bucket: process.env.AWS_BUCKET,     ///* required */     # Put your bucket name
//   Region: process.env.AWS_REGION
// });

// const bucketParams = { Bucket: process.env.AWS_BUCKET, Key: "hue/.config.json" };

// const getConfigFromS3 = async (bucketParams) => {



//   s3.getObject(bucketParams, function (err, data) {
//     if (err) {

//       console.log(err);
//       return err;
//     }

//     let objectData = data.Body.toString('utf-8');
//     return objectData;
//   }); 

//   return objectData;
// };

// console.log(bucketParams);

// let config = await getConfigFromS3(bucketParams);
// console.log(config);



  function putConfigToS3(bucketParams, config) {

    var params = {
      Bucket: bucketParams.Bucket,
      Key: bucketParams.Key,
      Body: JSON.stringify(config),
      ContentType: "application/json"
    };

    var putObjectPromise = s3.putObject(params).promise();
    putObjectPromise.then(function (data) {
      console.log("Successfully uploaded data to " + params.Bucket + "/" + params.Key);
    });
  }

//node --experimental-specifier-resolution=node -r dotenv/config .\s3.mjs