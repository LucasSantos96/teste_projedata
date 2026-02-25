package com.company.inventoryapi.controller;

import com.company.inventoryapi.dto.ProductRawMaterialRequestDTO;
import com.company.inventoryapi.dto.ProductRawMaterialResponseDTO;
import com.company.inventoryapi.service.ProductRawMaterialService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @GetMapping
    public ResponseEntity<List<ProductRawMaterialResponseDTO>> findByProductId(@PathVariable Long productId) {
        List<ProductRawMaterialResponseDTO> items = productRawMaterialService.findByProductId(productId);
        return ResponseEntity.ok(items);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductRawMaterialResponseDTO> update(
            @PathVariable Long productId,
            @PathVariable Long id,
            @Valid @RequestBody ProductRawMaterialRequestDTO dto) {
        ProductRawMaterialResponseDTO updated = productRawMaterialService.update(productId, id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long productId, @PathVariable Long id) {
        productRawMaterialService.delete(productId, id);
        return ResponseEntity.noContent().build();
    }
}
