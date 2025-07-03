package pentacode.backend.code.common.mapper.base;

import java.util.List;

public interface BaseMapper<T, D> {
    T mapToEntity(D dto);
    D mapToDTO(T entity);
    List<D> mapToListDTO(List<T> entity);
    List<T> mapToListEntity(List<D> dto);
}