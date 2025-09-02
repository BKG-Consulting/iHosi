import { EmailService } from './notifications';
export declare class SendGridEmailService implements EmailService {
    constructor();
    sendEmail(to: string, subject: string, body: string): Promise<boolean>;
}
export declare class AWSSESEmailService implements EmailService {
    sendEmail(to: string, subject: string, body: string): Promise<boolean>;
}
export declare class MailgunEmailService implements EmailService {
    sendEmail(to: string, subject: string, body: string): Promise<boolean>;
}
export declare class ConsoleEmailService implements EmailService {
    sendEmail(to: string, subject: string, body: string): Promise<boolean>;
}
