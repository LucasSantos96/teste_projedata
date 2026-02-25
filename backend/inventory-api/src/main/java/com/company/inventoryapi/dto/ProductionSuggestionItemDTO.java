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
public class ProductionSuggestionItemDTO {

    private Long productId;
    private String productCode;
    private String productName;
    private BigDecimal productPrice;
    private Integer maxProducibleQuantity;
    private BigDecimal totalValue;
}
