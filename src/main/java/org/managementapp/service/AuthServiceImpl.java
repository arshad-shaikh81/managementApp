package org.managementapp.service;

import org.managementapp.dto.ForgotPasswordResetRequest;
import org.managementapp.dto.ForgotPasswordSendOtpRequest;
import org.managementapp.dto.ForgotPasswordVerifyOtpRequest;
import org.managementapp.dto.LoginRequest;
import org.managementapp.dto.LoginResponse;
import org.managementapp.dto.RegisterResidentRequest;
import org.managementapp.dto.RegisterSocietyRequest;
import org.managementapp.entity.Society;
import org.managementapp.entity.User;
import org.managementapp.repository.SocietyRepository;
import org.managementapp.repository.UserRepository;
import org.managementapp.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private static final String FORGOT_PASSWORD_PURPOSE = "FORGOT_PASSWORD";

    @Autowired
    private SocietyRepository societyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private OtpService otpService;

    // ---------------- REGISTER SOCIETY (+ Admin) ----------------
    @Override
    public String registerSociety(RegisterSocietyRequest request) {

        if (societyRepository.findByRegistrationNumber(request.getRegistrationNumber()).isPresent()) {
            throw new RuntimeException("Society already registered with this registration number");
        }

        if (userRepository.findByPhone(request.getPhone()).isPresent()) {
            throw new RuntimeException("Phone number already registered");
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already registered");
        }

        if (societyRepository.findByName(request.getSocietyName()).isPresent()) {
            throw new RuntimeException("Society already registered with this name");
        }

        Society society = new Society();
        society.setName(request.getSocietyName());
        society.setAddress(request.getAddress());
        society.setRegistrationNumber(request.getRegistrationNumber());
        societyRepository.save(society);

        User admin = new User();
        admin.setName(request.getAdminName());
        admin.setPhone(request.getPhone());
        admin.setEmail(request.getEmail());
        admin.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        admin.setRole("admin");
        admin.setSociety(society);
        userRepository.save(admin);

        return "Society and admin registered successfully";
    }

    // ---------------- REGISTER RESIDENT ----------------
    @Override
    public String registerResident(RegisterResidentRequest request) {

        Society society = societyRepository.findByName(request.getSocietyName())
                .orElseThrow(() -> new RuntimeException("Society not found"));

        if (userRepository.findByPhone(request.getPhoneNumber()).isPresent()) {
            throw new RuntimeException("Phone number already registered");
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already registered");
        }

        User resident = new User();
        resident.setName(request.getName());
        resident.setPhone(request.getPhoneNumber());
        resident.setEmail(request.getEmail());
        resident.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        resident.setRole("resident");
        resident.setFlatNumber(request.getFlatNumber());
        resident.setSociety(society);

        userRepository.save(resident);

        return "Resident registered successfully";
    }

    // ---------------- LOGIN ----------------
    @Override
    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email is not registered"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Incorrect password");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

        return new LoginResponse(token, user.getRole(), user.getName());
    }

    // ---------------- FORGOT PASSWORD: SEND OTP ----------------
    @Override
    public String sendForgotPasswordOtp(ForgotPasswordSendOtpRequest request) {

        userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("No account found with this email address"));

        otpService.generateAndSend(request.getEmail(), FORGOT_PASSWORD_PURPOSE);

        return "OTP sent to your email address";
    }

    // ---------------- FORGOT PASSWORD: CHECK OTP ONLY (real-time, doesn't consume it) ----------------
    @Override
    public String verifyForgotPasswordOtp(ForgotPasswordVerifyOtpRequest request) {

        userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("No account found with this email address"));

        // Throws with a user-facing message if no OTP / expired / already used / too many attempts.
        // Returns false (rather than throwing) for a plain wrong digit-guess so the caller can
        // show "Incorrect OTP" without it looking like a hard error.
        boolean correct = otpService.checkOtp(request.getEmail(), FORGOT_PASSWORD_PURPOSE, request.getOtp());
        if (!correct) {
            throw new RuntimeException("Incorrect OTP");
        }

        return "OTP verified";
    }

    // ---------------- FORGOT PASSWORD: VERIFY OTP + RESET ----------------
    @Override
    public String resetPassword(ForgotPasswordResetRequest request) {

        if (request.getNewPassword() == null || !request.getNewPassword().matches("\\d{4}")) {
            throw new RuntimeException("Password must be exactly 4 digits");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("No account found with this email address"));

        // Throws with a user-facing message if OTP is wrong/expired/already used
        otpService.verify(request.getEmail(), FORGOT_PASSWORD_PURPOSE, request.getOtp());

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return "Password reset successfully";
    }
}