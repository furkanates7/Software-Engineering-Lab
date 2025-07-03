package pentacode.backend.code.courier.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CourierDTO {
    private Long pk;
    private String name;
    private String phoneNumber;
    private boolean isAvailable;
    private boolean isOnline;
    private String profilePictureUrl;
    private String email;
}