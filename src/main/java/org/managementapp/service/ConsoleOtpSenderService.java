package org.managementapp.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * DEV-ONLY OTP sender: prints the OTP to the server console/log instead of
 * sending a real SMS. This lets you test the full forgot-password flow
 * (send OTP -> read it from the console -> verify -> reset password)
 * without signing up for an SMS gateway.
 *
 * When you're ready to send real SMS, add MSG91's dependency-free HTTP call
 * here (or create a Msg91OtpSenderService implementing OtpSenderService,
 * annotate it @Primary, and remove/rename this class) — nothing else in the
 * app needs to change because everything else depends on the OtpSenderService
 * interface, not this class directly.
 */
@Service
public class ConsoleOtpSenderService implements OtpSenderService {

    private static final Logger log = LoggerFactory.getLogger(ConsoleOtpSenderService.class);

    @Override
    public void sendOtp(String phone, String otp) {
        log.info("==========================================");
        log.info(" [DEV MODE] OTP for {} is: {}", phone, otp);
        log.info(" (Replace ConsoleOtpSenderService with a real SMS gateway before going live)");
        log.info("==========================================");
    }
}