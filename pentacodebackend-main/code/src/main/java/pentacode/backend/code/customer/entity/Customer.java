package pentacode.backend.code.customer.entity;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pentacode.backend.code.auth.entity.User;
import pentacode.backend.code.common.entity.Order;
import pentacode.backend.code.common.entity.Review;
import pentacode.backend.code.common.entity.base.BaseAudityModel;
import pentacode.backend.code.restaurant.entity.Restaurant;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Customer extends BaseAudityModel{
    private String address;
    private String phoneNumber;
    private String name;

    private float longitude;
    private float latitude;
    @Email
    private String email;

    @OneToOne
    @JoinColumn(name = "order_id", referencedColumnName = "pk")
    @JsonIgnore
    private Order order;

    @OneToMany(mappedBy = "customer", fetch=FetchType.EAGER)
    @JsonIgnore
    private List<Order> orderHistory = new ArrayList<>();

    public void addOrderToHistory(Order order) {
        this.orderHistory.add(order);
    }

    // one to many relationship with favorite restaurants create the table do not use mapped by
    @ManyToMany(mappedBy="customers", fetch=FetchType.EAGER)
    @JsonIgnore
    private List<Restaurant> favoriteRestaurants;

    @ManyToMany(fetch=FetchType.EAGER)
    @JoinTable(
        name = "customer_favorite_orders",
        joinColumns = @JoinColumn(name = "customer_id"),
        inverseJoinColumns = @JoinColumn(name = "order_id")
    )
    @JsonIgnore
    private List<Order> favoriteOrders = new ArrayList<>();

    @OneToOne(mappedBy = "customer")
    @JsonIgnore
    private User user;

    @OneToMany(mappedBy = "customer", fetch=FetchType.EAGER)
    @JsonIgnore
    private List<Review> reviews = new ArrayList<>();

    private Double money = 0.0;
    
    private boolean deleted = false;
}
