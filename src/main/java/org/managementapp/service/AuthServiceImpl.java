package org.managementapp.service;

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

        User user = userRepository.findByPhone(request.getPhone())
                .orElseThrow(() -> new RuntimeException("Invalid phone or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid phone or password");
        }

        String token = jwtUtil.generateToken(user.getPhone(), user.getRole());

        return new LoginResponse(token, user.getRole(), user.getName());
    }
}