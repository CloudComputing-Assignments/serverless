require('dotenv').config();
const sgMail = require('@sendgrid/mail');
const AWS = require('aws-sdk');

// Initialize the AWS Secrets Manager client
const secretsManager = new AWS.SecretsManager();

exports.helloSNS = async (event, context) => {
  try {
    // Extract the SNS message from the event
    console.log("Received event:", JSON.stringify(event, null, 2));
    const snsMessage = JSON.parse(event.Records[0].Sns.Message);
    const { email, id, verification_token } = snsMessage;

    console.log("Extracted SNS message:", snsMessage);

    if (!email || !verification_token) {
      throw new Error('Missing email or verification token in SNS message');
    }

    // Retrieve the SendGrid API key from Secrets Manager
    const secretName = "sendgrid-api-key-v1"; // Replace with the actual secret name
    const secretValue = await secretsManager.getSecretValue({ SecretId: secretName }).promise();

    let sendgridApiKey;
    if ('SecretString' in secretValue) {
      sendgridApiKey = JSON.parse(secretValue.SecretString).SENDGRID_API_KEY;
    } else {
      throw new Error("SecretString is missing from the secret");
    }

    // Initialize the SendGrid API key
    sgMail.setApiKey(sendgridApiKey);

    // Prepare the email content to be sent via SendGrid
    const emailData = {
      to: email,
      from: 'Aayush Soni <noreply@aayushsoni237.me>', // Replace with your verified SendGrid sender email
      subject: 'Email Verification',
      text: `Please click on the link to verify your email: http://demo.aayushsoni237.me/v1/user/verify?token=${verification_token}`,
    };

    // Send the verification email
    const emailResponse = await sgMail.send(emailData);
    console.log('Email sent successfully:', emailResponse);

  } catch (error) {
    console.error('Failed to send email or process SNS message:', error);
  }
};
