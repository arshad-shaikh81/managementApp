package org.managementapp.controller;

import org.managementapp.entity.Society;
import org.managementapp.repository.SocietyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/society")
@CrossOrigin(origins = "*")
public class SocietyController {

    @Autowired
    private SocietyRepository societyRepository;

    @GetMapping("/search")
    public ResponseEntity<?> searchSociety(@RequestParam String name) {
        List<Society> results = societyRepository.findByNameContainingIgnoreCase(name);
        return ResponseEntity.ok(results);
    }
}