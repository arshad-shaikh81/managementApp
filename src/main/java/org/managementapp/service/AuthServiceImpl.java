package org.managementapp.service;

import org.managementapp.dto.LoginRequest;
import org.managementapp.dto.LoginResponse;
import org.managementapp.dto.ProfileResponse;
import org.managementapp.dto.RegisterResidentRequest;
import org.managementapp.dto.RegisterSocietyRequest;
import org.managementapp.dto.UpdateProfileRequest;
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

    @Autowired
    private SocietyRepository societyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

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
        society.setEmail(request.getEmail());
        society.setFlatNumber(request.getFlatNumber());
        societyRepository.save(society);

        User admin = new User();
        admin.setName(request.getAdminName());
        admin.setPhone(request.getPhone());
        admin.setEmail(request.getEmail());
        admin.setFlatNumber(request.getFlatNumber());
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

    // ---------------- GET LOGGED-IN USER'S REAL PROFILE ----------------
    @Override
    public ProfileResponse getProfile(String token) {

        String email;
        try {
            email = jwtUtil.extractEmail(token);
        } catch (RuntimeException e) {
            throw new RuntimeException("Invalid or expired session. Please login again.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Society society = user.getSociety();

        return new ProfileResponse(
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getFlatNumber(),
                society != null ? society.getName() : null,
                society != null ? society.getAddress() : null
        );
    }

    // ---------------- UPDATE LOGGED-IN USER'S PROFILE ----------------
    @Override
    public ProfileResponse updateProfile(String token, UpdateProfileRequest request) {

        String email;
        try {
            email = jwtUtil.extractEmail(token);
        } catch (RuntimeException e) {
            throw new RuntimeException("Invalid or expired session. Please login again.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Naam update
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName().trim());
        }

        // Flat / house number update
        if (request.getFlatNumber() != null && !request.getFlatNumber().trim().isEmpty()) {
            user.setFlatNumber(request.getFlatNumber().trim());
        }

        userRepository.save(user);

        Society society = user.getSociety();

        // Address society-level hai, isliye sirf admin hi society address update kar sakta he
        if (society != null && "admin".equalsIgnoreCase(user.getRole())
                && request.getAddress() != null && !request.getAddress().trim().isEmpty()) {
            society.setAddress(request.getAddress().trim());
            societyRepository.save(society);
        }

        return new ProfileResponse(
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getFlatNumber(),
                society != null ? society.getName() : null,
                society != null ? society.getAddress() : null
        );
    }
}