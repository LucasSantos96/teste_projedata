package com.company.inventoryapi.controller;

import com.company.inventoryapi.dto.RawMaterialRequestDTO;
import com.company.inventoryapi.dto.RawMaterialResponseDTO;
import com.company.inventoryapi.service.RawMaterialService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/raw-materials")
public class RawMaterialController {

    private final RawMaterialService rawMaterialService;

    public RawMaterialController(RawMaterialService rawMaterialService) {
        this.rawMaterialService = rawMaterialService;
    }

    @PostMapping
    public ResponseEntity<RawMaterialResponseDTO> save(@Valid @RequestBody RawMaterialRequestDTO dto) {
        RawMaterialResponseDTO saved = rawMaterialService.save(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping
    public ResponseEntity<List<RawMaterialResponseDTO>> findAll() {
        List<RawMaterialResponseDTO> rawMaterials = rawMaterialService.findAll();
        return ResponseEntity.ok(rawMaterials);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RawMaterialResponseDTO> findById(@PathVariable Long id) {
        RawMaterialResponseDTO rawMaterial = rawMaterialService.findById(id);
        return ResponseEntity.ok(rawMaterial);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RawMaterialResponseDTO> update(@PathVariable Long id, @Valid @RequestBody RawMaterialRequestDTO dto) {
        RawMaterialResponseDTO updated = rawMaterialService.update(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        rawMaterialService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
