package pentacode.backend.code.customer.dto;

import java.util.*;

import org.springframework.security.access.method.P;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import pentacode.backend.code.common.dto.OrderDTO;

@Getter
@Setter
@Builder
public class CustomerDTO {
    private Long pk;
    public String name;
    public String address;
    private float longitude;
    private float latitude;
    public String phoneNumber;
    public String email;
    public OrderDTO order;
    public List<OrderDTO> orderHistory;
    public List<OrderDTO> favoriteOrders;
}
