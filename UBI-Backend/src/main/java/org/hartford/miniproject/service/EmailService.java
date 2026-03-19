package org.hartford.miniproject.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.File;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@driveiq.com}")
    private String fromEmail;

    @Value("${app.mail.from.name:DriveIQ-Insurance}")
    private String fromName;

    @Async
    public void sendWelcomeEmail(String to, String name) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromName + " <" + fromEmail + ">");
            message.setTo(to);
            message.setSubject("Welcome to DriveIQ Insurance");
            message.setText("Dear " + name + ",\n\n" +
                    "Welcome to DriveIQ Insurance.\n\n" +
                    "Your account has been successfully created.\n" +
                    "You can now apply for insurance policies and track your driving-based premium.\n\n" +
                    "Thank you for joining our platform.");
            
            mailSender.send(message);
            log.info("Welcome email sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send welcome email to {}", to, e);
        }
    }

    @Async
    public void sendPolicyApprovedEmail(String to, String name, String policyName, Long policyId) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromName + " <" + fromEmail + ">");
            message.setTo(to);
            message.setSubject("Policy Approved");
            message.setText("Dear " + name + ",\n\n" +
                    "Your insurance policy application for " + policyName + " has been approved.\n\n" +
                    "Policy ID: " + policyId + "\n\n" +
                    "You can view your policy details in the customer dashboard.\n\n" +
                    "Thank you.");
            
            mailSender.send(message);
            log.info("Policy approval email sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send policy approval email to {}", to, e);
        }
    }

    @Async
    public void sendPolicyRejectedEmail(String to, String name, String policyName, String remarks) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromName + " <" + fromEmail + ">");
            message.setTo(to);
            message.setSubject("Policy Application Update");
            message.setText("Dear " + name + ",\n\n" +
                    "Your insurance policy application for " + policyName + " could not be approved at this time.\n\n" +
                    "Remarks: " + (remarks != null ? remarks : "None provided") + "\n\n" +
                    "Thank you.");
            
            mailSender.send(message);
            log.info("Policy rejection email sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send policy rejection email to {}", to, e);
        }
    }

    @Async
    public void sendDocumentsRequestedEmail(String to, String name, String remarks) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromName + " <" + fromEmail + ">");
            message.setTo(to);
            message.setSubject("Action Required: Documents Needed");
            message.setText("Dear " + name + ",\n\n" +
                    "Additional documents are required to process your policy application.\n\n" +
                    "Remarks: " + (remarks != null ? remarks : "Please provide necessary documents.") + "\n\n" +
                    "Please upload them through your customer dashboard.\n\n" +
                    "Thank you.");
            
            mailSender.send(message);
            log.info("Documents requested email sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send documents requested email to {}", to, e);
        }
    }

    @Async
    public void sendClaimApprovedEmail(String to, String name, Long claimId, double amount) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromName + " <" + fromEmail + ">");
            message.setTo(to);
            message.setSubject("Claim Approved \uD83C\uDF89");
            message.setText("Dear " + name + ",\n\n" +
                    "Your claim #" + claimId + " for $" + String.format("%.2f", amount) + " has been approved.\n\n" +
                    "The amount will be disbursed shortly.\n\n" +
                    "Thank you for choosing DriveIQ Insurance.");
            
            mailSender.send(message);
            log.info("Claim approval email sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send claim approval email to {}", to, e);
        }
    }

    @Async
    public void sendClaimRejectedEmail(String to, String name, Long claimId) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromName + " <" + fromEmail + ">");
            message.setTo(to);
            message.setSubject("Claim Application Update");
            message.setText("Dear " + name + ",\n\n" +
                    "We have reviewed your claim #" + claimId + " and unfortunately it has been rejected.\n\n" +
                    "You can view more details in your customer dashboard or contact support for more information.\n\n" +
                    "Thank you.");
            
            mailSender.send(message);
            log.info("Claim rejection email sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send claim rejection email to {}", to, e);
        }
    }

    @Async
    public void sendPaymentConfirmationEmail(String to, String name, String policyName, String transactionId, double amount, File invoicePdf) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom(fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject("Payment Successful - DriveIQ Insurance");

            String text = "Dear " + name + ",\n\n" +
                    "Your payment for policy " + policyName + " has been successfully completed.\n\n" +
                    "Amount: $" + String.format("%.2f", amount) + "\n" +
                    "Transaction ID: " + transactionId + "\n\n" +
                    "Please find your invoice attached to this email.\n\n" +
                    "Thank you for choosing DriveIQ Insurance.";
            
            helper.setText(text);
            
            if (invoicePdf != null && invoicePdf.exists()) {
                helper.addAttachment("Invoice_" + transactionId + ".pdf", invoicePdf);
            }

            mailSender.send(message);
            log.info("Payment confirmation email sent to {} for transaction {}", to, transactionId);
        } catch (Exception e) {
            log.error("Failed to send payment confirmation email to {}", to, e);
        }
    }

    @Async
    public void sendPasswordResetEmail(String to, String name, String token) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromName + " <" + fromEmail + ">");
            message.setTo(to);
            message.setSubject("Password Reset Request");
            
            String resetLink = "http://localhost:4200/reset-password?token=" + token;
            
            message.setText("Dear " + name + ",\n\n" +
                    "You requested a password reset.\n\n" +
                    "Click the link below to reset your password:\n" +
                    resetLink + "\n\n" +
                    "This link will expire in 15 minutes.\n\n" +
                    "If you did not request this, please ignore this email.\n\n" +
                    "Thank you.");
            
            mailSender.send(message);
            log.info("Password reset email sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}", to, e);
        }
    }

    @Async
    public void sendStaffAccountCreatedEmail(String to, String name, String role) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromName + " <" + fromEmail + ">");
            message.setTo(to);
            message.setSubject("DriveIQ Staff Account Created");
            message.setText("Dear " + name + ",\n\n" +
                    "An account has been created for you as a " + role + ".\n\n" +
                    "You can log in using your registered email.\n\n" +
                    "Please change your password after logging in.\n\n" +
                    "Best Regards,\n" +
                    "DriveIQ Team");
            
            mailSender.send(message);
            log.info("Staff account creation email sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send staff account creation email to {}", to, e);
        }
    }
}
