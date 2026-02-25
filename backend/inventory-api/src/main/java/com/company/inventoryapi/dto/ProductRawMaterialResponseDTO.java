package com.company.inventoryapi.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductRawMaterialResponseDTO {

    private Long id;
    private Long productId;
    private String productName;
    private Long rawMaterialId;
    private String rawMaterialName;
    private BigDecimal quantityRequired;
}
