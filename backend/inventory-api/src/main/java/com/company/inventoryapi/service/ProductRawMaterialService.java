package com.company.inventoryapi.service;

import com.company.inventoryapi.dto.ProductRawMaterialRequestDTO;
import com.company.inventoryapi.dto.ProductRawMaterialResponseDTO;
import com.company.inventoryapi.entity.Product;
import com.company.inventoryapi.entity.ProductRawMaterial;
import com.company.inventoryapi.entity.RawMaterial;
import com.company.inventoryapi.exception.NotFoundException;
import com.company.inventoryapi.repository.ProductRawMaterialRepository;
import com.company.inventoryapi.repository.ProductRepository;
import com.company.inventoryapi.repository.RawMaterialRepository;
import org.springframework.stereotype.Service;

@Service
public class ProductRawMaterialService {

    private final ProductRawMaterialRepository productRawMaterialRepository;
    private final ProductRepository productRepository;
    private final RawMaterialRepository rawMaterialRepository;

    public ProductRawMaterialService(
            ProductRawMaterialRepository productRawMaterialRepository,
            ProductRepository productRepository,
            RawMaterialRepository rawMaterialRepository) {
        this.productRawMaterialRepository = productRawMaterialRepository;
        this.productRepository = productRepository;
        this.rawMaterialRepository = rawMaterialRepository;
    }

    public ProductRawMaterialResponseDTO associate(Long productId, ProductRawMaterialRequestDTO dto) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found with id: " + productId));
        
        RawMaterial rawMaterial = rawMaterialRepository.findById(dto.getRawMaterialId())
                .orElseThrow(() -> new NotFoundException("RawMaterial not found with id: " + dto.getRawMaterialId()));

        ProductRawMaterial productRawMaterial = new ProductRawMaterial();
        productRawMaterial.setProduct(product);
        productRawMaterial.setRawMaterial(rawMaterial);
        productRawMaterial.setQuantityRequired(dto.getQuantityRequired());

        ProductRawMaterial saved = productRawMaterialRepository.save(productRawMaterial);
        return toResponseDTO(saved);
    }

    private ProductRawMaterialResponseDTO toResponseDTO(ProductRawMaterial prm) {
        return new ProductRawMaterialResponseDTO(
                prm.getId(),
                prm.getProduct().getId(),
                prm.getProduct().getName(),
                prm.getRawMaterial().getId(),
                prm.getRawMaterial().getName(),
                prm.getQuantityRequired()
        );
    }
}
