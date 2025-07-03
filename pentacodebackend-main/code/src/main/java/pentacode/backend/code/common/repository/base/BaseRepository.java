package pentacode.backend.code.common.repository.base;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import pentacode.backend.code.common.entity.base.BaseAudityModel;
import pentacode.backend.code.restaurant.entity.Menu;

@Service
public interface BaseRepository<O extends BaseAudityModel> extends JpaRepository<O, Long>, JpaSpecificationExecutor<O>{
    O findByPk(Long pk);
}
