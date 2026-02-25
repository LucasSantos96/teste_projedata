package com.company.inventoryapi.repository;

import com.company.inventoryapi.entity.ProductRawMaterial;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRawMaterialRepository extends JpaRepository<ProductRawMaterial, Long> {
}
