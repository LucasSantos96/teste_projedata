package com.company.inventoryapi.service;

import com.company.inventoryapi.dto.ProductRawMaterialRequestDTO;
import com.company.inventoryapi.entity.Product;
import com.company.inventoryapi.entity.ProductRawMaterial;
import com.company.inventoryapi.entity.RawMaterial;
import com.company.inventoryapi.exception.NotFoundException;
import com.company.inventoryapi.repository.ProductRawMaterialRepository;
import org.springframework.stereotype.Service;

@Service
public class ProductRawMaterialService {

    private final ProductRawMaterialRepository productRawMaterialRepository;
    private final ProductService productService;
    private final RawMaterialService rawMaterialService;

    public ProductRawMaterialService(
            ProductRawMaterialRepository productRawMaterialRepository,
            ProductService productService,
            RawMaterialService rawMaterialService) {
        this.productRawMaterialRepository = productRawMaterialRepository;
        this.productService = productService;
        this.rawMaterialService = rawMaterialService;
    }

    public ProductRawMaterial associate(Long productId, ProductRawMaterialRequestDTO dto) {
        Product product = productService.findById(productId);
        RawMaterial rawMaterial = rawMaterialService.findById(dto.getRawMaterialId());

        ProductRawMaterial productRawMaterial = new ProductRawMaterial();
        productRawMaterial.setProduct(product);
        productRawMaterial.setRawMaterial(rawMaterial);
        productRawMaterial.setQuantityRequired(dto.getQuantityRequired());

        return productRawMaterialRepository.save(productRawMaterial);
    }
}
