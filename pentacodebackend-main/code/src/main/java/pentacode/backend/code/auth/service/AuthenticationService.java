package pentacode.backend.code.auth.service;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;
import pentacode.backend.code.admin.entity.Admin;
import pentacode.backend.code.admin.repository.AdminRepository;
import pentacode.backend.code.admin.controller.AdminController;
import pentacode.backend.code.auth.CreateUserRequest;
import pentacode.backend.code.auth.CreateUserResponse;
import pentacode.backend.code.auth.LoginRequest;
import pentacode.backend.code.auth.LoginResponse;
import pentacode.backend.code.auth.ResetPasswordRequest;
import pentacode.backend.code.auth.entity.Role;
import pentacode.backend.code.auth.entity.Token;
import pentacode.backend.code.auth.entity.User;
import pentacode.backend.code.auth.repository.TokenRepository;
import pentacode.backend.code.auth.repository.UserRepository;
import pentacode.backend.code.courier.entity.Courier;
import pentacode.backend.code.courier.repository.CourierRepository;
import pentacode.backend.code.customer.controller.CustomerController;
import pentacode.backend.code.customer.entity.Customer;
import pentacode.backend.code.customer.repository.CustomerRepository;
import pentacode.backend.code.customer.service.CustomerService;
import pentacode.backend.code.restaurant.entity.Restaurant;
import pentacode.backend.code.restaurant.repository.RestaurantRepository;

@Service
public class AuthenticationService implements UserDetailsService{
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final JwtService jwtService;
    private final TokenRepository tokenRepository;
    private final RestaurantRepository restaurantRepository;
    private final CourierRepository courierRepository;
    private final CustomerRepository customerRepository;
    private final AdminRepository adminRepository;
    private final CustomerService customerService;


 
    
    public AuthenticationService(UserRepository userRepository, 
                                  BCryptPasswordEncoder bCryptPasswordEncoder,
                                  JwtService jwtService,
                                  TokenRepository tokenRepository, RestaurantRepository restaurantRepository,
                                  CourierRepository courierRepository,
                                  CustomerRepository customerRepository,
                                  AdminRepository adminRepository,
                                  CustomerService customerService) {

        this.restaurantRepository = restaurantRepository;
        this.userRepository = userRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
        this.jwtService = jwtService;
        this.tokenRepository = tokenRepository;
        this.courierRepository = courierRepository;
        this.customerRepository = customerRepository;
        this.adminRepository = adminRepository;
        this.customerService = customerService;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<User> user = userRepository.findByUsername(username);
        return user.orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
    }

    public CreateUserResponse createUser(CreateUserRequest request) {

        Set<Role> roles = request.getAuthorities();
        request.setUsername(request.getUsername()+request.getAuthorities().toString());
        System.out.println(request.getUsername());
        if(!userRepository.findByEmailAndAuthorities(request.getEmail(), roles).isEmpty()){
            return CreateUserResponse.builder()
                    .message("Email already exists")
                    .build();
        }
        if(!userRepository.findByUsernameAndAuthorities(request.getUsername(), roles).isEmpty()){
            return CreateUserResponse.builder()
                    .message("Username already exists")
                    .build();
        }

        User newUser = User.builder()
                .name(request.getName())
                .username(request.getUsername())
                .email(request.getEmail())
                .password(bCryptPasswordEncoder.encode(request.getPassword()))
                .authorities(request.getAuthorities())
                .accountNonExpired(true)
                .credentialsNonExpired(true)
                .isEnabled(true)
                .accountNonLocked(true)
                .isBanned(false)
                .build();

        Role role = roles.stream().findFirst().orElse(null);


        if(role.equals(Role.ROLE_RESTAURANT)){
            // initialize Restaurant object
            Restaurant restaurant = new Restaurant();
            restaurant.setName(request.getName());
            restaurant.setAddress(request.getRestaurantAddress());
            restaurant.setPhoneNumber(request.getRestaurantPhoneNumber());
            restaurant.setDescription(request.getRestaurantDescription());
            restaurant.setEmail(request.getEmail());
            restaurant.setFoodType(request.getFoodType());
            restaurant.setOpeningHours(request.getOpeningHours());
            restaurant.setClosingHours(request.getClosingHours());
            restaurant.setDeliveryTime(request.getDeliveryTime());
            restaurant.setDeliveryFee(request.getDeliveryFee());
            restaurant.setMinOrderAmount(request.getMinOrderAmount());
            restaurant.setMaxOrderAmount(request.getMaxOrderAmount());
            restaurant.setImageUrl(request.getImageUrl());
            restaurantRepository.save(restaurant);
            newUser.setRestaurant(restaurant);
        }
        else if(role.equals(Role.ROLE_COURIER)){
            // initialize Courier object
            Courier courier = new Courier();
            courier.setName(request.getName());
            courier.setPhoneNumber(request.getCourierPhoneNumber());
            courier.setAvailable(request.isAvailable());
            System.out.println(request.isOnline());
            System.out.println(request.isAvailable());
            courier.setOnline(request.isOnline());
            courier.setEmail(request.getEmail());
            courierRepository.save(courier);
            newUser.setCourier(courier);
        }
        else if(role.equals(Role.ROLE_CUSTOMER)){
            Customer customer = new Customer();
            customer.setName(request.getName());
            customer.setAddress(request.getCustomerAddress());
            customer.setPhoneNumber(request.getCustomerPhoneNumber());
            customer.setEmail(request.getEmail());
            customerRepository.save(customer);
            newUser.setCustomer(customer);
            customerService.createOrder(customer);
        }
        else if(role.equals(Role.ROLE_ADMIN)){
            // initialize Admin object
            Admin admin = new Admin();
            admin.setName(request.getName());
            admin.setEmail(request.getEmail());
            adminRepository.save(admin);
            newUser.setAdmin(admin);
        }

        var registeredUser = userRepository.save(newUser);
        var token = jwtService.generateToken(registeredUser.getUsername());
        saveToken(registeredUser, token);
        return CreateUserResponse.builder()
                .user(registeredUser)
                .message("Success").build();
    }


    public void saveToken(User user, String stringToken) {
        user.setToken(stringToken);
        Token token = Token.builder()
                .user_token(stringToken)
                .user(user)
                .revoked(false)
                .expired(false)
                .build();
        tokenRepository.save(token);
        user.setTokenEntity(token);
        userRepository.save(user);
    }

    public void allTokenExpired(User user) {
        List<Token> validUsersToken = tokenRepository.findAllValidTokensByUser(user.getId());
        if (validUsersToken.isEmpty()) {
            return;
        }
        for (Token token : validUsersToken) {
            token.setExpired(true);
            token.setRevoked(true);
        }
        tokenRepository.saveAll(validUsersToken);
    }

    public Optional<User> getByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public Optional<User> getByUsernameAndOptionalToken(String username, Set<Role> roles) {
        return userRepository.findByUsernameAndAuthorities(username, roles);
    }
    public Optional<User> banUser(Long UserId) {
        User user = userRepository.findById(UserId).orElseThrow(() -> new EntityNotFoundException("User not found"));
        user.setBanned(true);
        user.setAuthorities(null);
        userRepository.save(user);
        return userRepository.findById(UserId);
    }
    public Optional<User> unbanUser(Long UserId) {
        User user = userRepository.findById(UserId).orElseThrow(() -> new EntityNotFoundException("User not found"));
        System.out.println(user.getUsername());
        user.setBanned(false);
        userRepository.save(user);
        return userRepository.findById(UserId);
    }
    public Boolean getUserBanStatus(Long UserId){
        User user = userRepository.findById(UserId).orElseThrow(() -> new EntityNotFoundException("User not found"));
        return user.isBanned();
    }
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow(() -> new EntityNotFoundException("User not found"));
        if(request.getNewPassword().length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters long");
        }
        else if(!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }
        else if(request.getNewPassword().equals(user.getPassword())) {
            throw new IllegalArgumentException("New password cannot be the same as the old password");
        }
        user.setPassword(bCryptPasswordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}