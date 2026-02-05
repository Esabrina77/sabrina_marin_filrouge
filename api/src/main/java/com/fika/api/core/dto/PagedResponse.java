package com.fika.api.core.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.data.domain.Page;

import java.util.List;

@Schema(description = "Structure de réponse paginée standardisée")
public record PagedResponse<T>(
        @Schema(description = "Liste des éléments de la page actuelle") List<T> content,

        @Schema(description = "Numéro de la page actuelle (0-indexed)", example = "0") int pageNumber,

        @Schema(description = "Taille de la page", example = "10") int pageSize,

        @Schema(description = "Nombre total d'éléments en base", example = "100") long totalElements,

        @Schema(description = "Nombre total de pages", example = "10") int totalPages,

        @Schema(description = "Indique s'il s'agit de la dernière page", example = "false") boolean last) {
    public static <T> PagedResponse<T> of(Page<T> page) {
        return new PagedResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast());
    }
}
