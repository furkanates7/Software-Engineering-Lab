package pentacode.backend.code.restaurant.dto;


import java.util.List;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class RestaurantDTO {
    public String name;
    public Long pk;
    public Integer version;
    private List<MenuDTO> menus;
    private String imageUrl;
    private String address;
    private String phoneNumber;
    private String description;
    private String email;
    private String foodType;
    private String openingHours;
    private String closingHours;
    private Integer deliveryTime;
    private Integer deliveryFee;
    private Integer minOrderAmount;
    private Integer maxOrderAmount;
    private Double rating;
    private Integer numberOfRatings;
    private float longitude;
    private float latitude;
}
