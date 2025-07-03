package pentacode.backend.code.restaurant.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class FoodDTO {
    public String name;
    public String description;
    public double price;
    private String imageUrl;
    private String category;
    private boolean isAvailable;
    private boolean isDrink;
    // private List<MenuDTO> menus;
}
