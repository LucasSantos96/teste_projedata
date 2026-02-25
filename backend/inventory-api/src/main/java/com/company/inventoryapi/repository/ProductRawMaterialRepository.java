package com.company.inventoryapi.repository;

import com.company.inventoryapi.entity.ProductRawMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRawMaterialRepository extends JpaRepository<ProductRawMaterial, Long> {

    @Query("""
            select prm
            from ProductRawMaterial prm
            join fetch prm.product p
            join fetch prm.rawMaterial rm
            where p.id = :productId
            """)
    List<ProductRawMaterial> findByProductId(@Param("productId") Long productId);

    Optional<ProductRawMaterial> findByIdAndProductId(Long id, Long productId);
}
