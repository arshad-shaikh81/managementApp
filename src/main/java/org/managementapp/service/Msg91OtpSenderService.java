package org.managementapp.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/**
 * Sends real OTP SMS via MSG91. Not used by default anymore (login/forgot
 * password is email-based now) — kept here in case you add an SMS-based
 * flow later. Not marked @Primary, so EmailOtpSenderService is used instead.
 */
@Service
public class Msg91OtpSenderService implements OtpSenderService {

    private static final Logger log = LoggerFactory.getLogger(Msg91OtpSenderService.class);

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${msg91.authkey:}")
    private String authKey;

    @Value("${msg91.template-id:}")
    private String templateId;

    @Override
    public void sendOtp(String phone, String otp) {
        if (authKey == null || authKey.isBlank()) {
            log.warn("msg91.authkey is not set — falling back to console output.");
            log.info("[DEV MODE] OTP for {} is: {}", phone, otp);
            return;
        }

        String url = "https://control.msg91.com/api/v5/otp"
                + "?otp=" + otp
                + "&mobile=91" + phone
                + (templateId != null && !templateId.isBlank() ? "&template_id=" + templateId : "");

        HttpHeaders headers = new HttpHeaders();
        headers.set("authkey", authKey);
        headers.set("accept", "application/json");

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            log.info("MSG91 response for {}: {}", phone, response.getBody());
        } catch (Exception e) {
            log.error("Failed to send OTP via MSG91 to {}: {}", phone, e.getMessage());
            throw new RuntimeException("Could not send OTP SMS. Please try again.");
        }
    }
}