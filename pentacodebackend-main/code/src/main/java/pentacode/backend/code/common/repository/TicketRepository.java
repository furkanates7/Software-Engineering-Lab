package pentacode.backend.code.common.repository;
import java.util.List;

import pentacode.backend.code.common.repository.base.BaseRepository;

import org.springframework.data.jpa.repository.Query;

import pentacode.backend.code.common.entity.Ticket;

public interface TicketRepository extends BaseRepository<Ticket> {
    @Query("SELECT t FROM Ticket t WHERE t.user.id = :userId")
    List<Ticket> findAllByUserId(Long userId);

    @Query("SELECT t FROM Ticket t WHERE t.user.courier.id IS NOT NULL")
    List<Ticket> findAllByCourierIdNotNull();

    @Query("SELECT t FROM Ticket t WHERE t.user.customer.id IS NOT NULL")
    List<Ticket> findAllByCustomerIdNotNull();

    @Query("SELECT t FROM Ticket t WHERE t.user.restaurant.id IS NOT NULL")
    List<Ticket> findAllByRestaurantIdNotNull();

    @Query("SELECT t FROM Ticket t WHERE t.user.id = :userId AND t.isResolved = true")
    List<Ticket> findAllByUserIdAndResolvedTrue(Long userId);

    @Query("SELECT t FROM Ticket t WHERE t.user.id = :userId AND t.isResolved = false")
    List<Ticket> findAllByUserIdAndResolvedFalse(Long userId);
    
    
    
}
