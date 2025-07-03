package pentacode.backend.code.common.repository;

import java.util.List;

import org.springframework.data.jpa.repository.Query;

import pentacode.backend.code.common.entity.Order;
import pentacode.backend.code.common.entity.OrderStatusEnum;
import pentacode.backend.code.common.repository.base.BaseRepository;

public interface OrderRepository extends BaseRepository<Order>{
    @Query("SELECT o FROM Order o WHERE o.status != 'AT_CART' AND o.restaurant.pk = :restaurantId")
    List<Order> findByRestaurantPk(Long restaurantId);
    List<Order> findByCourierPk(Long courierId);
    List<Order> findByCourierPkAndCourierAssignmentAccepted(Long courierId, boolean accept);
    List<Order> findByCourierPkAndStatus(Long courierId, OrderStatusEnum status);
}
