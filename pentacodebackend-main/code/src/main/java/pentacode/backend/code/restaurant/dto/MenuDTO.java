package pentacode.backend.code.restaurant.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class MenuDTO {
    private Long pk;
    
    @NotBlank(message = "Name is required")
    private String name;
    
    private String description;
    
    @PositiveOrZero(message = "Price must be zero or positive")
    private double price;
    
    private String imageUrl;
    
    @JsonProperty("isAvailable")
    private boolean isAvailable;

    @JsonProperty("isDrink")
    private boolean isDrink;
    
    private String category;
    
    private List<Long> categoryPks;
    
    private List<FoodDTO> foods;
}