package org.managementapp.service;

import org.managementapp.dto.LoginRequest;
import org.managementapp.dto.LoginResponse;
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
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SocietyRepository societyRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // 1. Register Society + First Admin
    public String registerSociety(RegisterSocietyRequest request) {

        // Registration number already exist toh nahi karta
        if (societyRepository.findByRegistrationNumber(request.getRegistrationNumber()).isPresent()) {
            throw new RuntimeException("Yeh society already registered hai");
        }

        // Phone already exist toh nahi karta
        if (userRepository.findByPhone(request.getPhone()).isPresent()) {
            throw new RuntimeException("Yeh phone number already registered hai");
        }

        // Society create karo
        Society society = new Society();
        society.setName(request.getSocietyName());
        society.setAddress(request.getAddress());
        society.setRegistrationNumber(request.getRegistrationNumber());
        society.setStatus("active"); // abhi ke liye direct active (tumne bola tha extra verification nahi chahiye)
        societyRepository.save(society);

        // Admin (User) create karo
        User admin = new User();
        admin.setName(request.getAdminName());
        admin.setPhone(request.getPhone());
        admin.setEmail(request.getEmail());
        admin.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        admin.setRole("admin");
        admin.setStatus("active");
        admin.setSociety(society);
        userRepository.save(admin);

        return "Society aur Admin account successfully create ho gaya";
    }

    // 2. Login (Admin ya Resident dono)
    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByPhone(request.getPhone())
                .orElseThrow(() -> new RuntimeException("Account nahi mila"));

        if (!user.getStatus().equals("active")) {
            throw new RuntimeException("Aapka account active nahi hai");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Galat password");
        }

        String token = jwtUtil.generateToken(user.getPhone(), user.getRole());

        return new LoginResponse(token, user.getRole(), user.getName());
    }
}