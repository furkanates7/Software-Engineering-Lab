package pentacode.backend.code.common.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Builder;
import pentacode.backend.code.common.entity.base.BaseAudityModel;
import pentacode.backend.code.courier.entity.Courier;
import pentacode.backend.code.customer.entity.Customer;
import pentacode.backend.code.restaurant.entity.Restaurant;


@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Review extends BaseAudityModel {
    private String reviewText;
    private Integer rating;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @OneToOne
    @JoinColumn(name = "order_id")
    private Order order;

    @OneToOne
    @JoinColumn(name = "order_id_2")
    private Order order2;

    @ManyToOne
    @JoinColumn(name = "restaurant_id")
    private Restaurant restaurant;

    @ManyToOne
    @JoinColumn(name = "courier_id")
    @JsonIgnore
    private Courier courier;

    @Column(nullable = true, name = "is_courier_review")
    private boolean is_courier_review = false;
}
