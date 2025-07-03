package pentacode.backend.code.common.service.base;

import pentacode.backend.code.common.entity.base.BaseAudityModel;
import pentacode.backend.code.common.repository.base.BaseRepository;

public abstract class BaseService<Entity extends BaseAudityModel>{
	protected BaseRepository<Entity> repository;

    public BaseService(BaseRepository<Entity> repository){
        this.repository = repository;
    }

    public Entity findByPkOr404(Long pk){
        Entity entity = repository.findByPk(pk);
        if(entity == null){
            return null;
        }
        else{
            return entity;
        }
    }
}