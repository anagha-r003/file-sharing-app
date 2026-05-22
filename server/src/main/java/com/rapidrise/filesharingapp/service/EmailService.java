package com.rapidrise.filesharingapp.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    // ─── PASSWORD RESET EMAIL ──────────────────────────────────

    public void sendPasswordResetEmail(
            String toEmail,
            String resetLink
    ) {
        log.info("Sending password reset email to {}", toEmail);

        String subject = "Password Reset Request";

        String body =
                "You requested to reset your password.\n\n"
                        + "Click the link below to reset it:\n"
                        + resetLink + "\n\n"
                        + "This link expires in 15 minutes.\n\n"
                        + "If you did not request this, ignore this email.\n"
                        + "Your password will not be changed.";

        sendEmail(toEmail, subject, body);
    }

    public void sendShareLinkEmail(
            String toEmail,
            String senderName,
            String shareUrl,
            String message
    ) {

        log.info("Sending share link email to {}", toEmail);

        String subject =
                senderName + " shared a file with you";

        String body =
                senderName + " has shared a file with you.\n\n"
                        + (message != null && !message.isBlank()
                        ? "Message: " + message + "\n\n"
                        : "")
                        + "Click the link below to access the file:\n"
                        + shareUrl + "\n\n"
                        + "This link may expire based on the sender's settings.";

        sendEmail(toEmail, subject, body);
    }

    public void sendRestrictedOtpEmail(
            String toEmail,
            String fileName,
            String otp
    ) {

        log.info(
                "Sending restricted share OTP to {}",
                toEmail
        );

        String subject =
                "OTP for Secure File Access";

        String body =
                "You requested access to a secure shared file.\n\n"
                        + "File: "
                        + fileName
                        + "\n\n"
                        + "OTP: "
                        + otp
                        + "\n\n"
                        + "This OTP expires in 5 minutes.\n\n"
                        + "Do not share this OTP with anyone.";

        sendEmail(
                toEmail,
                subject,
                body
        );
    }


    // ─── COMMON SEND METHOD ────────────────────────────────────

    private void sendEmail(
            String toEmail,
            String subject,
            String body
    ) {
        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setFrom(fromEmail);
            mail.setTo(toEmail);
            mail.setSubject(subject);
            mail.setText(body);

            mailSender.send(mail);

            log.info("Email sent successfully to {}", toEmail);

        } catch (MailException e) {
            log.error(
                    "Failed to send email to {} : {}",
                    toEmail,
                    e.getMessage()
            );
            throw new RuntimeException("Unable to send email");
        }
    }
}
