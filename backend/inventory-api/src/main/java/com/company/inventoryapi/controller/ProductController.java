package com.company.inventoryapi.controller;

import com.company.inventoryapi.dto.ProductRequestDTO;
import com.company.inventoryapi.entity.Product;
import com.company.inventoryapi.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<List<Product>> findAll() {
        List<Product> products = productService.findAll();
        return ResponseEntity.ok(products);
    }

    @PostMapping
    public ResponseEntity<Product> save(@Valid @RequestBody ProductRequestDTO dto) {
        Product savedProduct = productService.save(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedProduct);
    }
}
