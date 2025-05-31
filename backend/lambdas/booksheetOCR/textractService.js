// backend/lambdas/booksheetOCR/textractService.js
// const { TextractClient, StartDocumentAnalysisCommand } = require("@aws-sdk/client-textract");
// const textract = new TextractClient({});

// const TEXTRACT_SNS_TOPIC_ARN = process.env.TEXTRACT_SNS_TOPIC_ARN; // For Textract to publish completion
// const TEXTRACT_ROLE_ARN = process.env.TEXTRACT_ROLE_ARN;           // Role Textract assumes for SNS access

/**
 * TODO: Starts an asynchronous document analysis job with AWS Textract.
 * @param {string} bucketName - The S3 bucket name.
 * @param {string} objectKey - The S3 object key.
 * @returns {Promise<string>} The JobId of the started Textract analysis.
 */
// async function startDocumentAnalysis(bucketName, objectKey) {
//   if (!TEXTRACT_SNS_TOPIC_ARN || !TEXTRACT_ROLE_ARN) {
//     throw new Error('Textract SNS Topic ARN or Role ARN not configured.');
//   }
//   const params = {
//     DocumentLocation: {
//       S3Object: {
//         Bucket: bucketName,
//         Name: objectKey,
//       },
//     },
//     FeatureTypes: ["FORMS", "TABLES"], // Analyze for forms and tables
//     NotificationChannel: {
//       SNSTopicArn: TEXTRACT_SNS_TOPIC_ARN,
//       RoleArn: TEXTRACT_ROLE_ARN,
//     },
//     // OutputConfig: { // Optional: specify S3 location for full results
//     //   S3Bucket: process.env.TEXTRACT_OUTPUT_BUCKET,
//     //   S3Prefix: 'ocr-results/'
//     // }
//   };
//   const command = new StartDocumentAnalysisCommand(params);
//   const data = await textract.send(command);
//   return data.JobId;
// }

// module.exports = { startDocumentAnalysis };
console.log('TODO: Implement Textract service (startDocumentAnalysis).');
module.exports = {}; // Placeholder
