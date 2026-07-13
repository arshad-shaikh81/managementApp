package org.managementapp.repository;

import org.managementapp.entity.Society;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SocietyRepository extends JpaRepository<Society, Long> {
    Optional<Society> findByRegistrationNumber(String registrationNumber);
    List<Society> findByNameContainingIgnoreCase(String name);
    Optional<Society> findByName(String name);
}