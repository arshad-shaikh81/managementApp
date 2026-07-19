package org.managementapp.service;

import org.managementapp.entity.OtpVerification;
import org.managementapp.repository.OtpVerificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class OtpService {

    private static final int OTP_LENGTH = 6;
    private static final int EXPIRY_MINUTES = 5;
    private static final int MAX_ATTEMPTS = 5;
    private static final int RESEND_COOLDOWN_SECONDS = 60;

    private final SecureRandom secureRandom = new SecureRandom();

    @Autowired
    private OtpVerificationRepository otpRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private OtpSenderService otpSenderService;

    /**
     * Generates a new OTP for the given email + purpose, stores it hashed,
     * and sends it via the configured OtpSenderService.
     * Throws if the last OTP for this email+purpose was requested too recently.
     */
    public void generateAndSend(String email, String purpose) {
        otpRepository.findFirstByEmailAndPurposeOrderByIdDesc(email, purpose).ifPresent(last -> {
            LocalDateTime cooldownEnds = last.getExpiryTime()
                    .minusMinutes(EXPIRY_MINUTES)
                    .plusSeconds(RESEND_COOLDOWN_SECONDS);
            if (LocalDateTime.now().isBefore(cooldownEnds)) {
                throw new RuntimeException("Please wait a bit before requesting another OTP");
            }
        });

        String otp = String.valueOf(100000 + secureRandom.nextInt(900000));

        OtpVerification record = new OtpVerification();
        record.setEmail(email);
        record.setPurpose(purpose);
        record.setOtpHash(passwordEncoder.encode(otp));
        record.setExpiryTime(LocalDateTime.now().plusMinutes(EXPIRY_MINUTES));
        otpRepository.save(record);

        otpSenderService.sendOtp(email, otp);
    }

    /**
     * Verifies the OTP for a email + purpose. Marks it verified on success so
     * it can only be consumed once. Throws with a user-facing message on failure.
     */
    public void verify(String email, String purpose, String otp) {
        OtpVerification record = otpRepository.findFirstByEmailAndPurposeOrderByIdDesc(email, purpose)
                .orElseThrow(() -> new RuntimeException("No OTP was requested for this email address"));

        if (record.isVerified()) {
            throw new RuntimeException("This OTP has already been used. Please request a new one");
        }

        if (LocalDateTime.now().isAfter(record.getExpiryTime())) {
            throw new RuntimeException("OTP has expired. Please request a new one");
        }

        if (record.getAttemptCount() >= MAX_ATTEMPTS) {
            throw new RuntimeException("Too many incorrect attempts. Please request a new OTP");
        }

        if (!passwordEncoder.matches(otp, record.getOtpHash())) {
            record.setAttemptCount(record.getAttemptCount() + 1);
            otpRepository.save(record);
            throw new RuntimeException("Incorrect OTP");
        }

        record.setVerified(true);
        otpRepository.save(record);
    }
}