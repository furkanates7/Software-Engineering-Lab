package pentacode.backend.code.common.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import jakarta.websocket.Decoder;
import pentacode.backend.code.auth.entity.User;
import pentacode.backend.code.common.dto.TicketDTO;
import pentacode.backend.code.common.entity.Text;
import pentacode.backend.code.common.entity.Ticket;
import pentacode.backend.code.common.mapper.TicketMapper;
import pentacode.backend.code.common.repository.TicketRepository;
import pentacode.backend.code.common.service.base.BaseService;

@Service
public class TicketService extends BaseService<Ticket> {
    TicketRepository ticketRepository;
    TicketMapper ticketMapper;
    public TicketService(TicketRepository ticketRepository, TicketMapper ticketMapper) {
        super(ticketRepository);
        this.ticketRepository = ticketRepository;
        this.ticketMapper = ticketMapper;
    }

    
    public void createTicket(User user, String subject) {
        Ticket ticket = new Ticket();
        ticket.setUser(user);
        ticket.setSubject(subject);
        ticket.setTicketRequests(new ArrayList<>());
        ticket.setTicketResponses(new ArrayList<>());
        ticket.setResolved(false);
        ticketRepository.save(ticket);
    }

    public void writeRequest(User user, TicketDTO ticketDTO) {
        Ticket ticket = ticketRepository.findByPk(ticketDTO.getPk());
        if (ticket == null) {
            throw new RuntimeException("Ticket not found");
        }
        if (ticket.isResolved()) {
            throw new RuntimeException("Ticket is already resolved");
        }
        // USE BUİLDER
        Text request = Text.builder()
                .text(ticketDTO.getTicketRequests().get(0).getText())
                .index(ticket.getIndex())
                .build();
        
        ticket.setIndex(ticket.getIndex() + 1);

        ticket.getTicketRequests().add(request);
        ticketRepository.save(ticket);
    }
    public void writeResponse(User user, TicketDTO ticketDTO) {
        Ticket ticket = ticketRepository.findByPk(ticketDTO.getPk());
        if (ticket == null) {
            throw new RuntimeException("Ticket not found");
        }
        if (ticket.isResolved()) {
            throw new RuntimeException("Ticket is already resolved");
        }
        Text response = new Text();
        response.setText(ticketDTO.getTicketResponses().get(0).getText());
        response.setIndex(ticket.getIndex());
        ticket.setIndex(ticket.getIndex() + 1);
        ticket.getTicketResponses().add(response);
        ticketRepository.save(ticket);
    }

    public TicketDTO getTicketChat(User user, Long ticketId) {
        Ticket ticket = ticketRepository.findByPk(ticketId);
        if (ticket == null) {
            throw new RuntimeException("Ticket not found");
        }
        TicketDTO ticketDTO = TicketDTO.builder()
                .subject(ticket.getSubject())
                .ticketRequests(ticket.getTicketRequests())
                .ticketResponses(ticket.getTicketResponses())
                .resolved(ticket.isResolved())
                .user(ticket.getUser())
                .pk(ticket.getPk())
                .build();
        return ticketDTO;
    }

    public List<TicketDTO> getAllTickets2(User user, String status) {
        if (status == null) {
            return ticketMapper.mapToListDTO(ticketRepository.findAllByUserId(user.getId()));
        } else if (status.equals("resolved")) {
            return ticketMapper.mapToListDTO(ticketRepository.findAllByUserIdAndResolvedTrue(user.getId()));
        } else if (status.equals("unresolved")) {
            return ticketMapper.mapToListDTO(ticketRepository.findAllByUserIdAndResolvedFalse(user.getId()));
        }
        else {
            throw new RuntimeException("Invalid status");
        }
    }    

    public List<TicketDTO> getAllTickets(String role) {
        System.out.println("role: " + role);    
        if (role == null){
            return ticketMapper.mapToListDTO(ticketRepository.findAll());
        }        
        else if (role.equals("customer")) {
            System.out.println("customer");
            return ticketMapper.mapToListDTO(ticketRepository.findAllByCustomerIdNotNull());
        }
        else if (role.equals("courier")) {
            return ticketMapper.mapToListDTO(ticketRepository.findAllByCourierIdNotNull());
        }
        else if (role.equals("restaurant")) {
            return ticketMapper.mapToListDTO(ticketRepository.findAllByRestaurantIdNotNull());
        }
        else {
            throw new RuntimeException("Invalid role");
        }
    }

    public void resolveTicket(User user, Long ticketId) {
        Ticket ticket = ticketRepository.findByPk(ticketId);
        if (ticket == null) {
            throw new RuntimeException("Ticket not found");
        }
        ticket.setResolved(true);
        ticketRepository.save(ticket);
    }
}
