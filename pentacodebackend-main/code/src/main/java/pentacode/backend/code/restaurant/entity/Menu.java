package pentacode.backend.code.restaurant.entity;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pentacode.backend.code.common.entity.Order;
import pentacode.backend.code.common.entity.base.BaseAudityModel;

@Entity
@Getter
@Setter
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Menu extends BaseAudityModel{
    private String name;
    private String description;
    private double price;

    @Column(name = "image_url")
    private String imageUrl;
    private String category;

    @Column(name = "is_available")
    private boolean isAvailable;

    @Column(name = "is_drink", nullable=true)
    private boolean isDrink;

    @ManyToMany
    @JoinTable(name = "menu_category",
            joinColumns = @JoinColumn(name = "menu_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id"))
    private List<Category> categories;

    @ManyToMany(mappedBy = "menus")
    private List<Order> orders;

    @ManyToOne
    @JoinColumn(name = "restaurant_id")
    private Restaurant restaurant;

    @Column(name = "is_deleted")
    private boolean isDeleted = false;
}