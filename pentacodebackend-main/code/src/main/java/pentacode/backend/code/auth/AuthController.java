package pentacode.backend.code.auth;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import pentacode.backend.code.auth.entity.User;
import pentacode.backend.code.auth.service.AuthenticationService;
import pentacode.backend.code.auth.service.LoginService;
import pentacode.backend.code.auth.service.TokenService;
import pentacode.backend.code.common.dto.TicketDTO;
import pentacode.backend.code.common.service.TicketService;
import pentacode.backend.code.common.utils.ResponseHandler;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationService authenticationService;
    private final LoginService loginService;
    private final TokenService tokenService;
    private final TicketService ticketService;

    public AuthController(AuthenticationService authenticationService, LoginService loginService, TokenService tokenService, TicketService ticketService) {
        this.authenticationService = authenticationService;
        this.loginService = loginService;
        this.tokenService = tokenService;
        this.ticketService = ticketService;
    }

    @PostMapping("/register")
    public ResponseEntity<CreateUserResponse> addNewUser(@Valid @RequestBody CreateUserRequest createUserRequest) {
        return new ResponseEntity<>(authenticationService.createUser(createUserRequest),HttpStatus.CREATED);
    }
    @PostMapping("/login")
    public ResponseEntity<?> generateToken(@Valid @RequestBody LoginRequest authRequest) {
        try {
            return new ResponseEntity<>(loginService.login(authRequest), HttpStatus.OK);
        } catch (Exception e) {
            return ResponseHandler.generatePkResponse(e.getMessage(), HttpStatus.BAD_REQUEST, null);
        }
    }
    @PostMapping("/admin-login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest authRequest) {
        return new ResponseEntity<>(loginService.login(authRequest), HttpStatus.OK);
    }
    @GetMapping("/validate-token")
    public ResponseEntity<String> validateToken() {
        return new ResponseEntity<>("Token is valid", HttpStatus.OK);
    }
    @PostMapping("/ban-user")
    public ResponseEntity<String> banUser(@RequestBody Long userId) {
        try {
            authenticationService.banUser(userId);
            return ResponseEntity.ok("User banned successfully.");
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something went wrong.");
        }
    }

    @PostMapping("/create-ticket")
    public ResponseEntity<String> createTicket(@AuthenticationPrincipal User user, @RequestParam String subject) {
        try {
            ticketService.createTicket(user, subject);
            return ResponseEntity.ok("Ticket created successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something went wrong.");
        }
    }

    @PostMapping("/write-request")
    public ResponseEntity<String> writeRequest(@AuthenticationPrincipal User user, @RequestBody TicketDTO ticketDTO) {
        // try {
            ticketService.writeRequest(user, ticketDTO);
            return ResponseEntity.ok("Request written successfully.");
        // } catch (Exception e) {
        //     return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        // }
    }

    @PostMapping("/write-response")
    public ResponseEntity<String> writeResponse(@AuthenticationPrincipal User user, @RequestBody TicketDTO ticketDTO) {
        try {
            ticketService.writeResponse(user, ticketDTO);
            return ResponseEntity.ok("Response written successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/get-tickets")
    public ResponseEntity<Object> getTickets(@AuthenticationPrincipal User user, @RequestParam(required = false) String status) {
        try {
            List<TicketDTO> tickets = ticketService.getAllTickets2(user, status);
            return ResponseHandler.generateListResponse("Success", HttpStatus.OK, tickets, tickets.size());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

     @GetMapping("/get-all-tickets")
    public ResponseEntity<Object> getAllTickets(@AuthenticationPrincipal User user, @RequestParam(required = false) String role) {
        try {
            List<TicketDTO> tickets = ticketService.getAllTickets(role);
            return ResponseHandler.generateListResponse("Success", HttpStatus.OK, tickets, tickets.size());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/get-ticket-chat/{pk}")
    public ResponseEntity<Object> getTicketChat(@AuthenticationPrincipal User user, @PathVariable Long pk) {
        try {
            TicketDTO ticketDTO = ticketService.getTicketChat(user, pk);
            return ResponseEntity.ok(ticketDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PostMapping("/resolve-ticket/{pk}")
    public ResponseEntity<String> resolveTicket(@AuthenticationPrincipal User user, @PathVariable Long pk) {
        try {
            ticketService.resolveTicket(user, pk);
            return ResponseEntity.ok("Ticket resolved successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Object> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            authenticationService.resetPassword(request);
            return ResponseEntity.ok(new ResetPasswordResponse("Password reset successfully."));
        } catch (EntityNotFoundException | IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResetPasswordResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResetPasswordResponse("Failed to reset password due to an internal error."));
        }
    }
    private static class ResetPasswordResponse {
        private String message;

        public ResetPasswordResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}
