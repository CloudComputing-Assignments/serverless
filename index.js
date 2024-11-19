require('dotenv').config();
const sgMail = require('@sendgrid/mail');
const AWS = require('aws-sdk');

// Initialize the SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Initialize the SNS service
const sns = new AWS.SNS();

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