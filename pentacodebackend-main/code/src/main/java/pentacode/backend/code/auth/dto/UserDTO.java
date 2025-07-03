package pentacode.backend.code.auth.dto;

import java.util.Set;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class UserDTO {
    private Long id;
    private String name;
    private String username;
    private String email;
    private boolean isBanned;
    private Set<String> roles;
    private String phoneNumber;
    private String address;
    private float longitude;
    private float latitude;
    private String profilePictureUrl;
}