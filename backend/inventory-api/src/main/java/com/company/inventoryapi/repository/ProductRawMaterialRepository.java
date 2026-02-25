package com.company.inventoryapi.repository;

import com.company.inventoryapi.entity.ProductRawMaterial;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRawMaterialRepository extends JpaRepository<ProductRawMaterial, Long> {

    List<ProductRawMaterial> findByProductId(Long productId);

    Optional<ProductRawMaterial> findByIdAndProductId(Long id, Long productId);
}
