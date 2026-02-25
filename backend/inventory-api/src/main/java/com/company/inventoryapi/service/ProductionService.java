package com.company.inventoryapi.service;

import com.company.inventoryapi.dto.ProductionSuggestionItemDTO;
import com.company.inventoryapi.dto.ProductionSuggestionResponseDTO;
import com.company.inventoryapi.entity.Product;
import com.company.inventoryapi.entity.ProductRawMaterial;
import com.company.inventoryapi.entity.RawMaterial;
import com.company.inventoryapi.repository.ProductRawMaterialRepository;
import com.company.inventoryapi.repository.ProductRepository;
import com.company.inventoryapi.repository.RawMaterialRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ProductionService {

    private final ProductRepository productRepository;
    private final RawMaterialRepository rawMaterialRepository;
    private final ProductRawMaterialRepository productRawMaterialRepository;

    public ProductionService(ProductRepository productRepository,
                             RawMaterialRepository rawMaterialRepository,
                             ProductRawMaterialRepository productRawMaterialRepository) {
        this.productRepository = productRepository;
        this.rawMaterialRepository = rawMaterialRepository;
        this.productRawMaterialRepository = productRawMaterialRepository;
    }

    public ProductionSuggestionResponseDTO calculateProductionSuggestions() {
        List<Product> products = productRepository.findAll();
        products.sort(Comparator.comparing(Product::getPrice).reversed());

        Map<Long, Integer> stockCopy = createStockCopy();

        List<ProductRawMaterial> allProductRawMaterials = productRawMaterialRepository.findAll();
        Map<Long, List<ProductRawMaterial>> productRawMaterialsMap = groupByProduct(allProductRawMaterials);

        List<ProductionSuggestionItemDTO> suggestions = new ArrayList<>();

        for (Product product : products) {
            List<ProductRawMaterial> requiredMaterials = productRawMaterialsMap.get(product.getId());

            if (requiredMaterials == null || requiredMaterials.isEmpty()) {
                continue;
            }

            Integer maxProducible = calculateMaxProducibleQuantity(requiredMaterials, stockCopy);

            if (maxProducible > 0) {
                deductMaterials(requiredMaterials, maxProducible, stockCopy);

                BigDecimal totalValue = product.getPrice()
                        .multiply(BigDecimal.valueOf(maxProducible))
                        .setScale(2, RoundingMode.HALF_UP);

                ProductionSuggestionItemDTO item = new ProductionSuggestionItemDTO(
                        product.getId(),
                        product.getCode(),
                        product.getName(),
                        product.getPrice(),
                        maxProducible,
                        totalValue
                );
                suggestions.add(item);
            }
        }

        ProductionSuggestionResponseDTO response = new ProductionSuggestionResponseDTO();
        response.setSuggestions(suggestions);
        response.setTotalProductsAnalyzed(products.size());

        return response;
    }

    private Map<Long, Integer> createStockCopy() {
        List<RawMaterial> rawMaterials = rawMaterialRepository.findAll();
        Map<Long, Integer> stockCopy = new HashMap<>();
        for (RawMaterial rawMaterial : rawMaterials) {
            stockCopy.put(rawMaterial.getId(), rawMaterial.getStockQuantity());
        }
        return stockCopy;
    }

    private Map<Long, List<ProductRawMaterial>> groupByProduct(List<ProductRawMaterial> productRawMaterials) {
        Map<Long, List<ProductRawMaterial>> map = new HashMap<>();
        for (ProductRawMaterial prm : productRawMaterials) {
            Long productId = prm.getProduct().getId();
            map.computeIfAbsent(productId, k -> new ArrayList<>()).add(prm);
        }
        return map;
    }

    private Integer calculateMaxProducibleQuantity(List<ProductRawMaterial> requiredMaterials,
                                                    Map<Long, Integer> stockCopy) {
        Integer minProducible = null;

        for (ProductRawMaterial prm : requiredMaterials) {
            Long rawMaterialId = prm.getRawMaterial().getId();
            Integer availableStock = stockCopy.get(rawMaterialId);

            if (availableStock == null || availableStock == 0) {
                return 0;
            }

            BigDecimal requiredQty = prm.getQuantityRequired();
            if (requiredQty == null || requiredQty.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            BigDecimal available = BigDecimal.valueOf(availableStock);
            BigDecimal producible = available.divide(requiredQty, RoundingMode.DOWN);
            Integer producibleInt = producible.intValue();

            if (minProducible == null || producibleInt < minProducible) {
                minProducible = producibleInt;
            }
        }

        return minProducible != null ? minProducible : 0;
    }

    private void deductMaterials(List<ProductRawMaterial> requiredMaterials,
                                  Integer quantity,
                                  Map<Long, Integer> stockCopy) {
        for (ProductRawMaterial prm : requiredMaterials) {
            Long rawMaterialId = prm.getRawMaterial().getId();
            BigDecimal requiredQty = prm.getQuantityRequired();
            Integer currentStock = stockCopy.get(rawMaterialId);

            BigDecimal totalDeduction = requiredQty.multiply(BigDecimal.valueOf(quantity));
            stockCopy.put(rawMaterialId, currentStock - totalDeduction.intValue());
        }
    }
}
