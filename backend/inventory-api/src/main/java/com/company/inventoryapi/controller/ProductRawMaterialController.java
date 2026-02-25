package com.company.inventoryapi.controller;

import com.company.inventoryapi.dto.ProductRawMaterialRequestDTO;
import com.company.inventoryapi.dto.ProductRawMaterialResponseDTO;
import com.company.inventoryapi.service.ProductRawMaterialService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/products/{productId}/raw-materials")
public class ProductRawMaterialController {

    private final ProductRawMaterialService productRawMaterialService;

    public ProductRawMaterialController(ProductRawMaterialService productRawMaterialService) {
        this.productRawMaterialService = productRawMaterialService;
    }

    @PostMapping
    public ResponseEntity<ProductRawMaterialResponseDTO> associate(
            @PathVariable Long productId,
            @Valid @RequestBody ProductRawMaterialRequestDTO dto) {
        ProductRawMaterialResponseDTO created = productRawMaterialService.associate(productId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
