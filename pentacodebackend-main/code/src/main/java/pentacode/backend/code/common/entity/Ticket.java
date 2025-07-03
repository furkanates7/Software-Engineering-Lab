package pentacode.backend.code.common.entity;

import java.util.ArrayList;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pentacode.backend.code.auth.entity.User;
import pentacode.backend.code.common.entity.base.BaseAudityModel;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Ticket extends BaseAudityModel {
    private String subject;
    private ArrayList<Text> ticketRequests;
    private ArrayList<Text> ticketResponses;
    
    @Column(name = "is_resolved")
    private boolean isResolved;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private Integer index = 0;
}

