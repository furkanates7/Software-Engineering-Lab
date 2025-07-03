package pentacode.backend.code.auth;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResetPasswordRequest {
    @NotBlank(message = "Email is mandatory")
    @Email(message = "Invalid email format")
    @JsonProperty("email")
    private String email;
    @NotBlank(message = "New password is mandatory")
    @JsonProperty("new_password")
    private String newPassword;
    @NotBlank(message = "Confirm password is mandatory")
    @JsonProperty("confirm_password")
    private String confirmPassword;
}