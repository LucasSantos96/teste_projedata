package com.company.inventoryapi.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductionSuggestionResponseDTO {

    private List<ProductionSuggestionItemDTO> suggestions;
    private Integer totalProductsAnalyzed;
}
