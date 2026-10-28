import Grievance from '../models/Grievance.js';
import { sendEscalationEmail } from './emailService.js';

// Check if grievance should be escalated based on vote threshold
export const checkEscalation = async (grievance) => {
  try {
    const threshold = parseInt(process.env.ESCALATION_THRESHOLD) || 50;

    // Check if threshold reached and not already escalated
    if (grievance.voteCount >= threshold && !grievance.isEscalated) {
      // Update grievance to escalated status
      grievance.isEscalated = true;
      grievance.isHighPriority = true;

      // Update status if still in submitted
      if (grievance.status === 'submitted') {
        grievance.status = 'in-review';
      }

      grievance.statusHistory.push({
        status: grievance.status,
        remarks: `Automatically escalated: Vote count (${grievance.voteCount}) reached threshold (${threshold})`
      });

      await grievance.save();

      // Send escalation email
      await sendEscalationEmail(grievance);

      console.log(`🚨 Grievance ${grievance._id} escalated - Votes: ${grievance.voteCount}`);

      return { escalated: true, voteCount: grievance.voteCount };
    }

    return { escalated: false, voteCount: grievance.voteCount };
  } catch (error) {
    console.error('❌ Escalation check error:', error.message);
    return { escalated: false, error: error.message };
  }
};

// Batch check all grievances for escalation (can be called by cron job)
export const batchEscalationCheck = async () => {
  try {
    const threshold = parseInt(process.env.ESCALATION_THRESHOLD) || 50;

    const grievances = await Grievance.find({
      voteCount: { $gte: threshold },
      isEscalated: false,
      isConfidential: false
    });

    for (const grievance of grievances) {
      await checkEscalation(grievance);
    }

    console.log(`✅ Batch escalation check complete - ${grievances.length} processed`);
    return { processed: grievances.length };
  } catch (error) {
    console.error('❌ Batch escalation error:', error.message);
    return { error: error.message };
  }
};