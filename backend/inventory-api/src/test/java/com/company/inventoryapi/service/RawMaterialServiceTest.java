package com.company.inventoryapi.service;

import com.company.inventoryapi.dto.RawMaterialRequestDTO;
import com.company.inventoryapi.dto.RawMaterialResponseDTO;
import com.company.inventoryapi.entity.RawMaterial;
import com.company.inventoryapi.exception.NotFoundException;
import com.company.inventoryapi.repository.RawMaterialRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RawMaterialServiceTest {

    @Mock
    private RawMaterialRepository rawMaterialRepository;

    @InjectMocks
    private RawMaterialService rawMaterialService;

    @Test
    void save_shouldReturnSavedEntity() {
        RawMaterialRequestDTO request = new RawMaterialRequestDTO("RM-001", "Steel", 120);

        RawMaterial savedRawMaterial = new RawMaterial();
        savedRawMaterial.setId(1L);
        savedRawMaterial.setCode("RM-001");
        savedRawMaterial.setName("Steel");
        savedRawMaterial.setStockQuantity(120);

        when(rawMaterialRepository.findByCode("RM-001")).thenReturn(Optional.empty());
        when(rawMaterialRepository.save(any(RawMaterial.class))).thenReturn(savedRawMaterial);

        RawMaterialResponseDTO result = rawMaterialService.save(request);

        assertEquals(1L, result.getId());
        assertEquals("RM-001", result.getCode());
        assertEquals("Steel", result.getName());
        assertEquals(120, result.getStockQuantity());
        verify(rawMaterialRepository).save(any(RawMaterial.class));
    }

    @Test
    void findById_shouldReturnEntity_whenFound() {
        RawMaterial rawMaterial = new RawMaterial();
        rawMaterial.setId(1L);
        rawMaterial.setCode("RM-001");
        rawMaterial.setName("Steel");
        rawMaterial.setStockQuantity(80);

        when(rawMaterialRepository.findById(1L)).thenReturn(Optional.of(rawMaterial));

        RawMaterialResponseDTO result = rawMaterialService.findById(1L);

        assertEquals(1L, result.getId());
        assertEquals("RM-001", result.getCode());
        assertEquals("Steel", result.getName());
        assertEquals(80, result.getStockQuantity());
    }

    @Test
    void findById_shouldThrowException_whenNotFound() {
        when(rawMaterialRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> rawMaterialService.findById(999L));
    }

    @Test
    void delete_shouldCallRepositoryDelete() {
        when(rawMaterialRepository.existsById(1L)).thenReturn(true);

        rawMaterialService.delete(1L);

        verify(rawMaterialRepository).deleteById(1L);
        verify(rawMaterialRepository, never()).findById(1L);
    }
}
