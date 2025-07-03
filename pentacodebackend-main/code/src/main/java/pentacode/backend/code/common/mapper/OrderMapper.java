package pentacode.backend.code.common.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import pentacode.backend.code.common.dto.OrderDTO;
import pentacode.backend.code.common.entity.Order;
import pentacode.backend.code.common.mapper.base.BaseMapper;

@Mapper(componentModel="spring")
public interface OrderMapper extends BaseMapper<Order, OrderDTO>{
    Order mapToEntity(OrderDTO orderDTO);
    OrderDTO mapToDTO(Order order);   
    List<OrderDTO> mapToListDTO(List<Order> orders);
    List<Order> mapToListEntity(List<OrderDTO> orderDTOs);
}
