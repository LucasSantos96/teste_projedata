package com.company.inventoryapi.service;

import com.company.inventoryapi.dto.ProductRequestDTO;
import com.company.inventoryapi.dto.ProductResponseDTO;
import com.company.inventoryapi.entity.Product;
import com.company.inventoryapi.exception.BusinessException;
import com.company.inventoryapi.exception.NotFoundException;
import com.company.inventoryapi.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<ProductResponseDTO> findAll() {
        return productRepository.findAll().stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public ProductResponseDTO findById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found with id: " + id));
        return toResponseDTO(product);
    }

    public ProductResponseDTO save(ProductRequestDTO dto) {
        productRepository.findByCode(dto.getCode())
                .ifPresent(existing -> {
                    throw new BusinessException("Product with code " + dto.getCode() + " already exists");
                });

        Product product = new Product();
        product.setCode(dto.getCode());
        product.setName(dto.getName());
        product.setPrice(dto.getPrice());
        Product saved = productRepository.save(product);
        return toResponseDTO(saved);
    }

    public ProductResponseDTO update(Long id, ProductRequestDTO dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found with id: " + id));

        productRepository.findByCode(dto.getCode())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new BusinessException("Product with code " + dto.getCode() + " already exists");
                });

        product.setCode(dto.getCode());
        product.setName(dto.getName());
        product.setPrice(dto.getPrice());
        Product updated = productRepository.save(product);
        return toResponseDTO(updated);
    }

    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new NotFoundException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }

    private ProductResponseDTO toResponseDTO(Product product) {
        return new ProductResponseDTO(
                product.getId(),
                product.getCode(),
                product.getName(),
                product.getPrice()
        );
    }
}
