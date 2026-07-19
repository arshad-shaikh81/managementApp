package org.managementapp.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

/**
 * Sends real OTP emails via SMTP (JavaMailSender).
 * Marked @Primary so Spring uses this automatically over
 * ConsoleOtpSenderService / Msg91OtpSenderService.
 *
 * If spring.mail.username is left blank in application.properties,
 * falls back to console logging so the app doesn't crash in dev
 * environments where SMTP isn't configured yet.
 */
@Service
@Primary
public class EmailOtpSenderService implements OtpSenderService {

    private static final Logger log = LoggerFactory.getLogger(EmailOtpSenderService.class);
    private static final String SENDER_DISPLAY_NAME = "Management Hub";

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromAddress;

    public EmailOtpSenderService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendOtp(String email, String otp) {
        if (fromAddress == null || fromAddress.isBlank()) {
            log.warn("spring.mail.username is not set — falling back to console output.");
            log.info("[DEV MODE] OTP for {} is: {}", email, otp);
            return;
        }

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, false, "UTF-8");

            // setFrom(email, displayName) -> inbox shows "Management Hub" instead of the raw address
            helper.setFrom(fromAddress, SENDER_DISPLAY_NAME);
            helper.setTo(email);
            helper.setSubject("Your OTP - Management Hub");

            String htmlBody =
                    "<div style=\"font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: auto; padding: 20px; color: #1a1f36; line-height: 1.6;\">"

                            + "<p>Hi,</p>"

                            + "<p>Use the verification code below to securely sign in to your <strong>SocietyHub</strong> account.</p>"

                            + "<div style=\"background: #f4f7ff; border: 1px solid #dbeafe; border-radius: 10px; padding: 20px; text-align: center; margin: 25px 0;\">"
                            + "<span style=\"font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #2563eb;\">"
                            + otp
                            + "</span>"
                            + "</div>"

                            + "<p><strong>⏰ This OTP is valid for 5 minutes.</strong></p>"

                            + "<p>For your security:</p>"
                            + "<ul style=\"padding-left: 20px; margin-top: 0;\">"
                            + "<li>Never share this code with anyone.</li>"
                            + "<li>SocietyHub will never ask for your OTP via phone, email, or chat.</li>"
                            + "<li>If you didn't request this code, you can safely ignore this email. Your account remains secure.</li>"
                            + "</ul>"

                            + "<p>Thank you for choosing SocietyHub.</p>"

                            + "<p>Regards,<br>SocietyHub Team</p>"

                            + "</div>";
    
            helper.setText(htmlBody, true);

            mailSender.send(mimeMessage);
            log.info("OTP email sent to {}", email);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", email, e.getMessage());
            throw new RuntimeException("Could not send OTP email. Please try again.");
        }
    }
}