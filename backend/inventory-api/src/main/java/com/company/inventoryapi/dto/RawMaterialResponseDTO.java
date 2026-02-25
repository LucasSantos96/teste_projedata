package com.company.inventoryapi.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RawMaterialResponseDTO {

    private Long id;
    private String code;
    private String name;
    private Integer stockQuantity;
}
