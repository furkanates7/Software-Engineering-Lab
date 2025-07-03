package pentacode.backend.code.courier.mapper;

import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import pentacode.backend.code.common.mapper.base.BaseMapper;
import pentacode.backend.code.courier.dto.CourierDTO;
import pentacode.backend.code.courier.entity.Courier;

@Mapper(componentModel = "spring")
public interface CourierMapper extends BaseMapper<Courier, CourierDTO> {
    @Mapping(source = "available", target = "available")
    @Mapping(source = "online", target = "online")
    Courier mapToEntity(CourierDTO courierDTO);

    @Mapping(source = "available", target = "available")
    @Mapping(source = "online", target = "online")
    CourierDTO mapToDTO(Courier courier);
    
    List<CourierDTO> mapToListDTO(List<Courier> couriers);
    List<Courier> mapToListEntity(List<CourierDTO> courierDTOs);
}