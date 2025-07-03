package pentacode.backend.code.restaurant.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Null;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pentacode.backend.code.common.entity.Order;
import pentacode.backend.code.common.entity.Review;
import pentacode.backend.code.common.entity.base.BaseAudityModel;
import pentacode.backend.code.customer.entity.Customer;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Restaurant extends BaseAudityModel {
    @Column(name="restaurant_name", unique=true, nullable=false )
    private String name;

    @OneToMany(mappedBy = "restaurant")
    @JsonIgnore
    private List<Order> orders;

    @OneToMany(mappedBy = "restaurant", fetch=FetchType.EAGER)
    @JsonIgnore
    private List<Menu> menus;

    @OneToMany(mappedBy = "restaurant")
    @JsonIgnore
    private List<Category> categories;

    @ManyToOne
    @JsonIgnore
    private Restaurant restaurant;
    
    private String imageUrl;
    private String address;
    private String phoneNumber;
    private String description;

    @Email
    private String email;

    private String foodType;
    private String openingHours;
    private String closingHours;
    private Integer deliveryTime;
    private Integer deliveryFee;
    private Integer minOrderAmount;
    private Integer maxOrderAmount;

    private Double rating = 0.0;
    private Integer numberOfRatings = 0;

    // many to one customer, create the table fields
    @ManyToMany
    @JoinTable(name = "restaurant_customer",
            joinColumns = @JoinColumn(name = "restaurant_id"),
            inverseJoinColumns = @JoinColumn(name = "customer_id"))
    @JsonIgnore
    private List<Customer> customers;
    private float longitude;
    private float latitude;

    @OneToMany(mappedBy = "restaurant", fetch=FetchType.EAGER)
    @JsonIgnore
    private List<Review> reviews = new ArrayList<>();

    public Restaurant orElseThrow(Object object) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'orElseThrow'");
    }
    
    private boolean deleted = false;
}