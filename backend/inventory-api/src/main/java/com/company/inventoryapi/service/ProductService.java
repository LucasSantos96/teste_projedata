package com.company.inventoryapi.service;

import com.company.inventoryapi.dto.ProductRequestDTO;
import com.company.inventoryapi.entity.Product;
import com.company.inventoryapi.exception.BusinessException;
import com.company.inventoryapi.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> findAll() {
        return productRepository.findAll();
    }

    public Product save(ProductRequestDTO dto) {
        productRepository.findByCode(dto.getCode())
                .ifPresent(existing -> {
                    throw new BusinessException("Product with code " + dto.getCode() + " already exists");
                });

        Product product = new Product();
        product.setCode(dto.getCode());
        product.setName(dto.getName());
        product.setPrice(dto.getPrice());
        return productRepository.save(product);
    }
}
