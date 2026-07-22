package org.managementapp.controller;

import org.managementapp.dto.LoginRequest;
import org.managementapp.dto.LoginResponse;
import org.managementapp.dto.RegisterSocietyRequest;
import org.managementapp.dto.RegisterResidentRequest;
import org.managementapp.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")   // frontend alag origin se call kare toh block na ho
public class AuthController {

    @Autowired
    private AuthService authService;

    // Society Register (Admin bhi isi se banega)
    @PostMapping("/register-society")
    public ResponseEntity<?> registerSociety(@RequestBody RegisterSocietyRequest request) {
        try {
            String message = authService.registerSociety(request);
            return ResponseEntity.ok(message);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Resident Register (existing society me join karega)
    @PostMapping("/register-resident")
    public ResponseEntity<?> registerResident(@RequestBody RegisterResidentRequest request) {
        try {
            String message = authService.registerResident(request);
            return ResponseEntity.ok(message);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Login (Admin + Resident dono)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}