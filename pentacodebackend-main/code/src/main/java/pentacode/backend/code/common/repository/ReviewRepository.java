package pentacode.backend.code.common.repository;
import org.springframework.data.jpa.repository.Query;

import pentacode.backend.code.common.entity.Review;
import pentacode.backend.code.common.repository.base.BaseRepository;

import java.util.List;
public interface ReviewRepository extends BaseRepository<Review>{
    // get the review based on order id and courier id
    @Query("SELECT r FROM Review r WHERE r.order2.id = ?1 AND r.courier.id = ?2")
    Review findByOrderIdAndCourierId(Long orderId, Long courierId);
    
    @Query("SELECT r FROM Review r WHERE r.restaurant.id IS NOT NULL")
    List<Review> findByRestaurantIdNotNull();

    @Query("SELECT r FROM Review r WHERE r.courier.id IS NOT NULL")
    List<Review> findByCourierIdNotNull();

    @Query("SELECT r FROM Review r WHERE r.restaurant.id = ?1")
    List<Review> findByRestaurantId(Long restaurantId);

    @Query("SELECT r FROM Review r WHERE r.courier.id = ?1")
    List<Review> findByCourierId(Long courierId);
}