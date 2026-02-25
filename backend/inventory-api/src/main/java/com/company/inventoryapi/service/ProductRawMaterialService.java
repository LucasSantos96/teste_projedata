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

import java.util.List;

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
        Product product = findProductById(productId);
        RawMaterial rawMaterial = rawMaterialRepository.findById(dto.getRawMaterialId())
                .orElseThrow(() -> new NotFoundException("RawMaterial not found with id: " + dto.getRawMaterialId()));

        ProductRawMaterial productRawMaterial = new ProductRawMaterial();
        productRawMaterial.setProduct(product);
        productRawMaterial.setRawMaterial(rawMaterial);
        productRawMaterial.setQuantityRequired(dto.getQuantityRequired());

        ProductRawMaterial saved = productRawMaterialRepository.save(productRawMaterial);
        return toResponseDTO(saved);
    }

    public List<ProductRawMaterialResponseDTO> findByProductId(Long productId) {
        findProductById(productId);
        return productRawMaterialRepository.findByProductId(productId)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public ProductRawMaterialResponseDTO update(Long productId, Long id, ProductRawMaterialRequestDTO dto) {
        ProductRawMaterial existing = productRawMaterialRepository.findByIdAndProductId(id, productId)
                .orElseThrow(() -> new NotFoundException(
                        "Product raw material not found with id: " + id + " for product id: " + productId));

        RawMaterial rawMaterial = rawMaterialRepository.findById(dto.getRawMaterialId())
                .orElseThrow(() -> new NotFoundException("RawMaterial not found with id: " + dto.getRawMaterialId()));

        existing.setRawMaterial(rawMaterial);
        existing.setQuantityRequired(dto.getQuantityRequired());

        ProductRawMaterial updated = productRawMaterialRepository.save(existing);
        return toResponseDTO(updated);
    }

    public void delete(Long productId, Long id) {
        ProductRawMaterial existing = productRawMaterialRepository.findByIdAndProductId(id, productId)
                .orElseThrow(() -> new NotFoundException(
                        "Product raw material not found with id: " + id + " for product id: " + productId));
        productRawMaterialRepository.delete(existing);
    }

    private Product findProductById(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found with id: " + productId));
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
