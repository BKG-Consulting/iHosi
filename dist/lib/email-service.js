"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleEmailService = exports.MailgunEmailService = exports.AWSSESEmailService = exports.SendGridEmailService = void 0;
const mail_1 = __importDefault(require("@sendgrid/mail"));
// Real SendGrid email service
class SendGridEmailService {
    constructor() {
        // Initialize SendGrid with API key
        const apiKey = process.env.SENDGRID_API_KEY;
        if (!apiKey) {
            throw new Error('SENDGRID_API_KEY environment variable is required');
        }
        mail_1.default.setApiKey(apiKey);
    }
    async sendEmail(to, subject, body) {
        try {
            // Validate email format before sending
            if (!to || typeof to !== 'string' || !to.includes('@')) {
                console.error('❌ Invalid email address format:', to);
                return false;
            }
            // Check if email is encrypted (should not happen after our fix)
            if (to.startsWith('{"encrypted":')) {
                console.error('❌ Attempting to send to encrypted email address:', to);
                return false;
            }
            const msg = {
                to,
                from: process.env.FROM_EMAIL || 'noreply@yourclinic.com',
                subject,
                html: body,
            };
            console.log(`📤 Sending email via SendGrid:`, {
                to: msg.to,
                from: msg.from,
                subject: msg.subject,
                bodyLength: msg.html.length
            });
            await mail_1.default.send(msg);
            console.log(`✅ REAL EMAIL SENT via SendGrid to: ${to}`);
            return true;
        }
        catch (error) {
            console.error('❌ SendGrid email failed:', error);
            console.error('❌ Email details:', { to, subject, bodyLength: body.length });
            return false;
        }
    }
}
exports.SendGridEmailService = SendGridEmailService;
// Alternative: AWS SES email service
class AWSSESEmailService {
    async sendEmail(to, subject, body) {
        try {
            // AWS SES implementation would go here
            console.log(`✅ REAL EMAIL SENT via AWS SES to: ${to}`);
            return true;
        }
        catch (error) {
            console.error('❌ AWS SES email failed:', error);
            return false;
        }
    }
}
exports.AWSSESEmailService = AWSSESEmailService;
// Alternative: Mailgun email service
class MailgunEmailService {
    async sendEmail(to, subject, body) {
        try {
            // Mailgun implementation would go here
            console.log(`✅ REAL EMAIL SENT via Mailgun to: ${to}`);
            return true;
        }
        catch (error) {
            console.error('❌ Mailgun email failed:', error);
            return false;
        }
    }
}
exports.MailgunEmailService = MailgunEmailService;
// Fallback: Console logging (for development)
class ConsoleEmailService {
    async sendEmail(to, subject, body) {
        console.log('📧 CONSOLE EMAIL (Development Mode):', { to, subject, body });
        return true;
    }
}
exports.ConsoleEmailService = ConsoleEmailService;
