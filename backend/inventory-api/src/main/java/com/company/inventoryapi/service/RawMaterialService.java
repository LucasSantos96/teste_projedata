package com.company.inventoryapi.service;

import com.company.inventoryapi.dto.RawMaterialRequestDTO;
import com.company.inventoryapi.dto.RawMaterialResponseDTO;
import com.company.inventoryapi.entity.RawMaterial;
import com.company.inventoryapi.exception.BusinessException;
import com.company.inventoryapi.exception.NotFoundException;
import com.company.inventoryapi.repository.RawMaterialRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RawMaterialService {

    private final RawMaterialRepository rawMaterialRepository;

    public RawMaterialService(RawMaterialRepository rawMaterialRepository) {
        this.rawMaterialRepository = rawMaterialRepository;
    }

    public List<RawMaterialResponseDTO> findAll() {
        return rawMaterialRepository.findAll().stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public RawMaterialResponseDTO findById(Long id) {
        RawMaterial rawMaterial = rawMaterialRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("RawMaterial not found with id: " + id));
        return toResponseDTO(rawMaterial);
    }

    public RawMaterialResponseDTO save(RawMaterialRequestDTO dto) {
        rawMaterialRepository.findByCode(dto.getCode())
                .ifPresent(existing -> {
                    throw new BusinessException("RawMaterial with code " + dto.getCode() + " already exists");
                });

        RawMaterial rawMaterial = new RawMaterial();
        rawMaterial.setCode(dto.getCode());
        rawMaterial.setName(dto.getName());
        rawMaterial.setStockQuantity(dto.getStockQuantity());
        RawMaterial saved = rawMaterialRepository.save(rawMaterial);
        return toResponseDTO(saved);
    }

    public RawMaterialResponseDTO update(Long id, RawMaterialRequestDTO dto) {
        RawMaterial rawMaterial = rawMaterialRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("RawMaterial not found with id: " + id));

        rawMaterialRepository.findByCode(dto.getCode())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new BusinessException("RawMaterial with code " + dto.getCode() + " already exists");
                });

        rawMaterial.setCode(dto.getCode());
        rawMaterial.setName(dto.getName());
        rawMaterial.setStockQuantity(dto.getStockQuantity());
        RawMaterial updated = rawMaterialRepository.save(rawMaterial);
        return toResponseDTO(updated);
    }

    public void delete(Long id) {
        if (!rawMaterialRepository.existsById(id)) {
            throw new NotFoundException("RawMaterial not found with id: " + id);
        }
        rawMaterialRepository.deleteById(id);
    }

    private RawMaterialResponseDTO toResponseDTO(RawMaterial rawMaterial) {
        return new RawMaterialResponseDTO(
                rawMaterial.getId(),
                rawMaterial.getCode(),
                rawMaterial.getName(),
                rawMaterial.getStockQuantity()
        );
    }
}
