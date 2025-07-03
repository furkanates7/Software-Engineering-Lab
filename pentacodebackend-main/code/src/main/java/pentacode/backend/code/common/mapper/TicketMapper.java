package pentacode.backend.code.common.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import pentacode.backend.code.common.dto.OrderDTO;
import pentacode.backend.code.common.dto.TicketDTO;
import pentacode.backend.code.common.dto.TicketDTO;
import pentacode.backend.code.common.entity.Order;
import pentacode.backend.code.common.entity.Ticket;
import pentacode.backend.code.common.entity.Ticket;
import pentacode.backend.code.common.mapper.base.BaseMapper;

@Mapper(componentModel="spring")
public interface TicketMapper extends BaseMapper<Ticket, TicketDTO>{
    Ticket mapToEntity(TicketDTO TicketDTO);
    TicketDTO mapToDTO(Ticket Ticket);   
    List<TicketDTO> mapToListDTO(List<Ticket> Tickets);
    List<Ticket> mapToListEntity(List<TicketDTO> TicketDTOs);
}


