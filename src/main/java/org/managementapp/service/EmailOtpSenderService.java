package org.managementapp.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * Sends real OTP emails via Brevo's HTTP API (not SMTP, so it works fine on
 * Render's free tier where SMTP ports are blocked). Marked @Primary so this
 * is the OtpSenderService implementation used by default, ahead of
 * ConsoleOtpSenderService and Msg91OtpSenderService.
 */
@Service
@Primary
public class EmailOtpSenderService implements OtpSenderService {

    private static final Logger log = LoggerFactory.getLogger(EmailOtpSenderService.class);

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    @Value("${brevo.sender.email}")
    private String senderEmail;

    @Value("${brevo.sender.name}")
    private String senderName;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public void sendOtp(String toEmail, String otp) {
        String url = "https://api.brevo.com/v3/smtp/email";

        HttpHeaders headers = new HttpHeaders();
        headers.set("api-key", brevoApiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> sender = new HashMap<>();
        sender.put("name", senderName);
        sender.put("email", senderEmail);

        Map<String, Object> recipient = new HashMap<>();
        recipient.put("email", toEmail);

        Map<String, Object> body = new HashMap<>();
        body.put("sender", sender);
        body.put("to", new Object[]{recipient});
        body.put("subject", "Your OTP Code");
        body.put("htmlContent", "<p>Your OTP code is: <b>" + otp + "</b></p><p>This code is valid for a limited time.</p>");

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            restTemplate.postForEntity(url, request, String.class);
            log.info("OTP email sent via Brevo to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email via Brevo to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Could not send OTP email. Please try again.");
        }
    }
}