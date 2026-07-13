package org.managementapp.service;

import org.managementapp.dto.LoginRequest;
import org.managementapp.dto.LoginResponse;
import org.managementapp.dto.RegisterSocietyRequest;
import org.managementapp.dto.RegisterResidentRequest;

public interface AuthService {
    String registerSociety(RegisterSocietyRequest request);
    String registerResident(RegisterResidentRequest request);
    LoginResponse login(LoginRequest request);
}