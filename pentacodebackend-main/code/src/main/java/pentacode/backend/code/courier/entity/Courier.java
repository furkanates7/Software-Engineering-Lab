package pentacode.backend.code.courier.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.validation.constraints.Email;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pentacode.backend.code.common.entity.Order;
import pentacode.backend.code.common.entity.base.BaseAudityModel;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Courier extends BaseAudityModel {
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String phoneNumber;
    
    @Column(nullable = false)
    @JsonProperty("isAvailable")
    private boolean isAvailable;
    
    @Column(nullable = false)
    @JsonProperty("isOnline")
    private boolean isOnline;
    
    @OneToMany(mappedBy = "courier")
    @JsonIgnore
    private List<Order> orders;

    @Column(nullable = false)
    @Email
    private String email;

    private String profilePictureUrl;
    
    private boolean deleted = false;

    private Double rating = 0.0;
    private Integer ratingCount = 0;
}