package pentacode.backend.code.customer.mapper;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import pentacode.backend.code.common.mapper.base.BaseMapper;
import pentacode.backend.code.common.mapper.OrderMapper;
import pentacode.backend.code.customer.dto.CustomerDTO;
import pentacode.backend.code.customer.entity.Customer;

@Mapper(componentModel="spring", uses = {OrderMapper.class})
public interface CustomerMapper extends BaseMapper<Customer, CustomerDTO> {
    @Mapping(target = "order", source = "order")
    @Mapping(target = "orderHistory", source = "orderHistory")
    CustomerDTO mapToDTO(Customer customer);
    
    @Mapping(target = "order", source = "order")
    @Mapping(target = "orderHistory", source = "orderHistory")
    Customer mapToEntity(CustomerDTO customerDTO);
    
    List<CustomerDTO> mapToListDTO(List<Customer> customers);
}