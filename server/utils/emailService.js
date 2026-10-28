import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send escalation email to authorities
export const sendEscalationEmail = async (grievance, recipientEmail = null) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"SHIKAYAT Portal" <${process.env.EMAIL_USER}>`,
      to: recipientEmail || process.env.EMAIL_USER, // Default to admin email
      subject: `🚨 HIGH PRIORITY GRIEVANCE ESCALATION - ${grievance.department}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0f1e36; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">SHIKAYAT</h1>
            <p style="margin: 5px 0 0 0;">Student Grievance Redressal Portal</p>
          </div>
          
          <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
            <h2 style="color: #dc2626;">⚠️ High Priority Escalation Alert</h2>
            
            <p>The following grievance has crossed the escalation threshold and requires immediate attention:</p>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Grievance ID:</strong> ${grievance._id}</p>
              <p><strong>Title:</strong> ${grievance.title}</p>
              <p><strong>Department:</strong> ${grievance.department}</p>
              <p><strong>Category:</strong> ${grievance.category}</p>
              <p><strong>Vote Count:</strong> <span style="color: #dc2626; font-weight: bold;">${grievance.voteCount}</span></p>
              <p><strong>Status:</strong> ${grievance.status}</p>
              <p><strong>Description:</strong></p>
              <p style="background: white; padding: 10px; border-radius: 3px;">${grievance.description}</p>
            </div>
            
            <p style="color: #dc2626; font-weight: bold;">
              ⚡ This issue has exceeded ${process.env.ESCALATION_THRESHOLD || 50} votes and has been marked as HIGH PRIORITY.
            </p>
            
            <p>Please take immediate action to address this concern.</p>
            
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e0e0e0;">
            <p style="color: #666; font-size: 12px;">
              This is an automated notification from SHIKAYAT Portal.<br>
              Generated on: ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Escalation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send error:', error.message);
    return { success: false, error: error.message };
  }
};

// Send confidential complaint notification
export const sendConfidentialNotification = async (grievance, recipientEmail = null) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"SHIKAYAT Portal" <${process.env.EMAIL_USER}>`,
      to: recipientEmail || process.env.EMAIL_USER,
      subject: `🔒 CONFIDENTIAL COMPLAINT - ${grievance.category}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0f1e36; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">SHIKAYAT</h1>
            <p style="margin: 5px 0 0 0;">Confidential Complaint Notification</p>
          </div>
          
          <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
            <h2 style="color: #7c3aed;">🔒 Confidential Complaint Received</h2>
            
            <p style="color: #dc2626; font-weight: bold;">
              This complaint has been flagged as CONFIDENTIAL and requires immediate review by the ICC/Administrative Committee.
            </p>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Complaint ID:</strong> ${grievance._id}</p>
              <p><strong>Category:</strong> ${grievance.category}</p>
              <p><strong>Department:</strong> ${grievance.department}</p>
              <p><strong>Submitted:</strong> ${new Date(grievance.createdAt).toLocaleString()}</p>
            </div>
            
            <p><strong>⚠️ Note:</strong> The identity of the reporter has been protected. Please log in to the admin portal to view full details and take appropriate action.</p>
            
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e0e0e0;">
            <p style="color: #666; font-size: 12px;">
              This is a confidential automated notification from SHIKAYAT Portal.<br>
              Generated on: ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Confidential notification sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send error:', error.message);
    return { success: false, error: error.message };
  }
};