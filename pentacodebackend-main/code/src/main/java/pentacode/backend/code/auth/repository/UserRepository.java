package pentacode.backend.code.auth.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.Set;

import pentacode.backend.code.auth.entity.Role;
import pentacode.backend.code.auth.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String userName);
    Optional<User> findByEmail(String email);
    Optional<User> findById(Long id);

    @Query("SELECT u FROM User u JOIN u.authorities r WHERE u.username = :username AND r IN :roles")    
    Optional<User> findByUsernameAndAuthorities(@Param("username") String username, @Param("roles") Set<Role> roles);

    @Query("SELECT u FROM User u JOIN u.authorities r WHERE u.email = :email AND r IN :roles")
    Optional<User> findByEmailAndAuthorities(@Param("email") String email, @Param("roles") Set<Role> roles);

    Optional<User> findByRestaurant_pk(Long restaurantId);
    Optional<User> findByCourier_pk(Long courierId);
    Optional<User> findByCustomer_pk(Long customerId);
    Optional<User> findByAdmin_pk(Long adminId);
}
