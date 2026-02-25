package com.company.inventoryapi.service;

import com.company.inventoryapi.dto.ProductionSuggestionItemDTO;
import com.company.inventoryapi.dto.ProductionSuggestionResponseDTO;
import com.company.inventoryapi.entity.Product;
import com.company.inventoryapi.entity.ProductRawMaterial;
import com.company.inventoryapi.entity.RawMaterial;
import com.company.inventoryapi.repository.ProductRawMaterialRepository;
import com.company.inventoryapi.repository.ProductRepository;
import com.company.inventoryapi.repository.RawMaterialRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductionServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private RawMaterialRepository rawMaterialRepository;

    @Mock
    private ProductRawMaterialRepository productRawMaterialRepository;

    @InjectMocks
    private ProductionService productionService;

    @Test
    void calculateProductionSuggestions_shouldOrderByPriceAndCalculateQuantitiesAndTotalValues() {
        Product expensiveProduct = new Product(1L, "P-EXP", "Expensive Product", new BigDecimal("50.00"));
        Product cheapProduct = new Product(2L, "P-CHP", "Cheap Product", new BigDecimal("20.00"));

        RawMaterial sharedMaterial = new RawMaterial(1L, "RM-001", "Steel", 11);

        ProductRawMaterial expensiveRequirement = new ProductRawMaterial(
                1L,
                expensiveProduct,
                sharedMaterial,
                new BigDecimal("3")
        );
        ProductRawMaterial cheapRequirement = new ProductRawMaterial(
                2L,
                cheapProduct,
                sharedMaterial,
                new BigDecimal("2")
        );

        when(productRepository.findAll()).thenReturn(new ArrayList<>(List.of(cheapProduct, expensiveProduct)));
        when(rawMaterialRepository.findAll()).thenReturn(List.of(sharedMaterial));
        when(productRawMaterialRepository.findAll()).thenReturn(List.of(expensiveRequirement, cheapRequirement));

        ProductionSuggestionResponseDTO result = productionService.calculateProductionSuggestions();

        assertEquals(2, result.getTotalProductsAnalyzed());
        assertEquals(2, result.getSuggestions().size());

        ProductionSuggestionItemDTO firstSuggestion = result.getSuggestions().get(0);
        ProductionSuggestionItemDTO secondSuggestion = result.getSuggestions().get(1);

        assertEquals("P-EXP", firstSuggestion.getProductCode());
        assertEquals(3, firstSuggestion.getMaxProducibleQuantity());
        assertEquals(new BigDecimal("150.00"), firstSuggestion.getTotalValue());

        assertEquals("P-CHP", secondSuggestion.getProductCode());
        assertEquals(1, secondSuggestion.getMaxProducibleQuantity());
        assertEquals(new BigDecimal("20.00"), secondSuggestion.getTotalValue());
    }
}
