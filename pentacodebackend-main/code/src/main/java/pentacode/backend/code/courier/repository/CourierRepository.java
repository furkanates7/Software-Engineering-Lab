package pentacode.backend.code.courier.repository;

import java.util.List;
import pentacode.backend.code.common.repository.base.BaseRepository;
import pentacode.backend.code.courier.entity.Courier;

public interface CourierRepository extends BaseRepository<Courier> {
    Courier findByPk(Long pk);
    List<Courier> findByIsOnlineAndIsAvailable(boolean isOnline, boolean isAvailable);
    Courier findByPkAndDeletedFalse(Long pk);
    List<Courier> findAllByDeletedFalse();
}