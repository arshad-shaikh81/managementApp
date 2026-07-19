package org.managementapp.repository;

import org.managementapp.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {

    // Latest OTP for an email + purpose combo (used to verify against the most recent request)
    Optional<OtpVerification> findFirstByEmailAndPurposeOrderByIdDesc(String email, String purpose);
}