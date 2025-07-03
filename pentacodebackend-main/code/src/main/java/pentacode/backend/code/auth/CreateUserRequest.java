package pentacode.backend.code.auth;


import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

import com.fasterxml.jackson.annotation.JsonProperty;

import pentacode.backend.code.auth.entity.Role;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateUserRequest {
    private String name;

    private String username;

    private String password;

    @Email
    private String email;

    Set<Role> authorities;

    private String restaurantAddress;
    private String restaurantPhoneNumber;
    private String restaurantDescription;
    private String imageUrl;
    private String foodType;
    private String openingHours;
    private String closingHours;
    private Integer deliveryTime;
    private Integer deliveryFee;
    private Integer minOrderAmount;
    private Integer maxOrderAmount;

    private String courierPhoneNumber;
    @JsonProperty("isAvailable")
    private boolean isAvailable;
    
    @JsonProperty("isOnline")
    private boolean isOnline;

    private String customerAddress;
    private String customerPhoneNumber;
}

