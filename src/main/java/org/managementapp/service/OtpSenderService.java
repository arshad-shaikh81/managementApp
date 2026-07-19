package org.managementapp.service;

public interface OtpSenderService {
    void sendOtp(String phone, String otp);
}