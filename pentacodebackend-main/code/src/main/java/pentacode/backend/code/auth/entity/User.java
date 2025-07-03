package pentacode.backend.code.auth.entity;

import java.util.Collection;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Set;

import pentacode.backend.code.admin.entity.Admin;
import pentacode.backend.code.common.entity.Ticket;
import pentacode.backend.code.courier.entity.Courier;
import pentacode.backend.code.customer.entity.Customer;
import pentacode.backend.code.restaurant.entity.Restaurant;

@Data
@Entity
@Table(name = "users")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;

    private String username;

    @JsonIgnore
    private String password;

    @Email
    private String email;

    private boolean accountNonExpired;
    private boolean isEnabled;
    private boolean accountNonLocked;
    private boolean credentialsNonExpired;
    @JsonProperty("is_banned")
    private boolean isBanned;

    @ElementCollection(targetClass = Role.class, fetch = FetchType.EAGER)
    @JoinTable(name = "authorities", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role", nullable = false)
    @Enumerated(EnumType.STRING)
    private Set<Role> authorities;


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @JsonProperty
    private String token;

    // one to one token
    @OneToOne
    @JoinColumn(name = "token_id")
    private Token tokenEntity;


    @OneToOne
    @JoinColumn(name = "restaurant_id")  // This will create a "restaurant_id" foreign key column in users table
    private Restaurant restaurant;

    @OneToOne
    @JoinColumn(name = "courier_id")  // This will create a "courier_id" foreign key column in users table
    private Courier courier;

    @OneToOne
    @JoinColumn(name = "customer_id")  // This will create a "customer_id" foreign key column in users table
    private Customer customer;
    
    @OneToOne
    @JoinColumn(name = "admin_id")  // This will create a "admin_id" foreign key column in users table
    private Admin admin;
}
