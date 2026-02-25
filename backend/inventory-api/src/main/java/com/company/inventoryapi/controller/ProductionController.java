package com.company.inventoryapi.controller;

import com.company.inventoryapi.dto.ProductionSuggestionResponseDTO;
import com.company.inventoryapi.service.ProductionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/production")
public class ProductionController {

    private final ProductionService productionService;

    public ProductionController(ProductionService productionService) {
        this.productionService = productionService;
    }

    @GetMapping("/suggestions")
    public ResponseEntity<ProductionSuggestionResponseDTO> getProductionSuggestions() {
        ProductionSuggestionResponseDTO suggestions = productionService.calculateProductionSuggestions();
        return ResponseEntity.ok(suggestions);
    }
}
