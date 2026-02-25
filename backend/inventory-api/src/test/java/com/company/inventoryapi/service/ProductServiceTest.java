package com.company.inventoryapi.service;

import com.company.inventoryapi.dto.ProductRequestDTO;
import com.company.inventoryapi.dto.ProductResponseDTO;
import com.company.inventoryapi.entity.Product;
import com.company.inventoryapi.exception.NotFoundException;
import com.company.inventoryapi.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    @Test
    void save_shouldReturnSavedEntity() {
        ProductRequestDTO request = new ProductRequestDTO("P-001", "Product A", new BigDecimal("25.50"));

        Product savedProduct = new Product();
        savedProduct.setId(1L);
        savedProduct.setCode("P-001");
        savedProduct.setName("Product A");
        savedProduct.setPrice(new BigDecimal("25.50"));

        when(productRepository.findByCode("P-001")).thenReturn(Optional.empty());
        when(productRepository.save(any(Product.class))).thenReturn(savedProduct);

        ProductResponseDTO result = productService.save(request);

        assertEquals(1L, result.getId());
        assertEquals("P-001", result.getCode());
        assertEquals("Product A", result.getName());
        assertEquals(new BigDecimal("25.50"), result.getPrice());
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void findById_shouldReturnEntity_whenFound() {
        Product product = new Product();
        product.setId(1L);
        product.setCode("P-001");
        product.setName("Product A");
        product.setPrice(new BigDecimal("10.00"));

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        ProductResponseDTO result = productService.findById(1L);

        assertEquals(1L, result.getId());
        assertEquals("P-001", result.getCode());
        assertEquals("Product A", result.getName());
        assertEquals(new BigDecimal("10.00"), result.getPrice());
    }

    @Test
    void findById_shouldThrowException_whenNotFound() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> productService.findById(999L));
    }

    @Test
    void delete_shouldCallRepositoryDelete() {
        when(productRepository.existsById(1L)).thenReturn(true);

        productService.delete(1L);

        verify(productRepository).deleteById(1L);
        verify(productRepository, never()).findById(1L);
    }
}
