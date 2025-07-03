package pentacode.backend.code.restaurant.entity;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pentacode.backend.code.common.entity.base.BaseAudityModel;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Category extends BaseAudityModel{
    private String name;
    private String description;

    @Column(name = "image_url", nullable=true)
    private String imageUrl;
    private String category;

    @Column(name = "is_available", nullable=true)
    private boolean isAvailable;
    
    @ManyToMany(mappedBy = "categories")
    private List<Menu> menus;

    @ManyToOne
    private Restaurant restaurant;
}
