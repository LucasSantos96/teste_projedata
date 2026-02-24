package com.company.inventoryapi.service;

import com.company.inventoryapi.dto.RawMaterialRequestDTO;
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

    public List<RawMaterial> findAll() {
        return rawMaterialRepository.findAll();
    }

    public RawMaterial findById(Long id) {
        return rawMaterialRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("RawMaterial not found with id: " + id));
    }

    public RawMaterial save(RawMaterialRequestDTO dto) {
        rawMaterialRepository.findByCode(dto.getCode())
                .ifPresent(existing -> {
                    throw new BusinessException("RawMaterial with code " + dto.getCode() + " already exists");
                });

        RawMaterial rawMaterial = new RawMaterial();
        rawMaterial.setCode(dto.getCode());
        rawMaterial.setName(dto.getName());
        rawMaterial.setStockQuantity(dto.getStockQuantity());
        return rawMaterialRepository.save(rawMaterial);
    }

    public RawMaterial update(Long id, RawMaterialRequestDTO dto) {
        RawMaterial rawMaterial = findById(id);

        rawMaterialRepository.findByCode(dto.getCode())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new BusinessException("RawMaterial with code " + dto.getCode() + " already exists");
                    }
                });

        rawMaterial.setCode(dto.getCode());
        rawMaterial.setName(dto.getName());
        rawMaterial.setStockQuantity(dto.getStockQuantity());
        return rawMaterialRepository.save(rawMaterial);
    }

    public void delete(Long id) {
        findById(id);
        rawMaterialRepository.deleteById(id);
    }
}
