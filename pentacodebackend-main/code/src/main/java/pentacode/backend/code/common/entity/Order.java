package pentacode.backend.code.common.entity;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pentacode.backend.code.common.entity.base.BaseAudityModel;
import pentacode.backend.code.courier.entity.Courier;
import pentacode.backend.code.customer.entity.Customer;
import pentacode.backend.code.restaurant.entity.Menu;
import pentacode.backend.code.restaurant.entity.Restaurant;

@Entity
@Getter
@Setter
@Table(name = "orders")
@AllArgsConstructor
@NoArgsConstructor
public class Order extends BaseAudityModel {
    private String name;
    
    @ManyToOne
    @JoinColumn(name = "restaurant_id")
    @JsonIgnore
    private Restaurant restaurant;
    
    @ManyToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinTable(name = "order_menu",
            joinColumns = @JoinColumn(name = "order_id"),
            inverseJoinColumns = @JoinColumn(name = "menu_id"))
    private List<Menu> menus;
    
    @ManyToOne
    @JoinColumn(name = "courier_id")
    @JsonIgnore
    private Courier courier;
    
    @Enumerated(EnumType.STRING)
    private OrderStatusEnum status = OrderStatusEnum.AT_CART;
    
    private boolean courierAssignmentAccepted = false;

    private double totalPrice = 0.0;

    @OneToMany(mappedBy = "order", cascade=CascadeType.ALL, fetch=FetchType.EAGER)
    private List<OrderItem> orderItems;

    @ManyToOne(fetch=FetchType.LAZY)
    @JsonIgnore
    @JoinColumn(name = "customer_id") // FK in the orders table
    private Customer customer;

    private boolean isRated = false;
    private Integer rating;

    @OneToOne(mappedBy = "order", cascade=CascadeType.ALL, fetch=FetchType.EAGER)
    private Review reviews;
}
