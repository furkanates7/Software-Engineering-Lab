package pentacode.backend.code.common.dto;

import java.util.ArrayList;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import pentacode.backend.code.auth.entity.User;
import pentacode.backend.code.common.entity.Text;

@Getter
@Setter
@Builder
public class TicketDTO {
    private String subject;
    private ArrayList<Text> ticketRequests;
    private ArrayList<Text> ticketResponses;
    private boolean resolved;
    private Long pk;
    private User user;
}
