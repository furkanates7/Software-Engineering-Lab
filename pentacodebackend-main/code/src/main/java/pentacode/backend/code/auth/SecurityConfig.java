package pentacode.backend.code.auth;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

import pentacode.backend.code.auth.service.AuthenticationService;
import pentacode.backend.code.auth.service.LogoutService;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    private final JWTAuthFilter jwtAuthFilter;
    private final AuthenticationService authenticationService;
    private final PasswordEncoder passwordEncoder;
    private final LogoutService logoutHandler;

    public SecurityConfig(JWTAuthFilter jwtAuthFilter, AuthenticationService userService, PasswordEncoder passwordEncoder, LogoutService logoutHandler) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.authenticationService = userService;
        this.passwordEncoder = passwordEncoder;
        this.logoutHandler = logoutHandler;
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        return httpSecurity
                .cors()
                .and()
                .csrf().disable()
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers(
                                "/api/auth/register",
                                "/api/auth/login",
                                "/api/auth/admin-login",
                                "/api/auth/validate-token",
                                "/images/**",
                                "/api/order/rate-order/**",
                                "/api/auth/reset-password"

                        ).permitAll()
                        // Allow OPTIONS for all endpoints without authentication
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Role-based endpoints
                        .requestMatchers("/api/restaurant/all").hasRole("CUSTOMER")
                        .requestMatchers("/api/restaurant/get").hasRole("CUSTOMER")
                        .requestMatchers("/api/order/courier/**").hasRole("COURIER")
                        // TODO: UPDATING THE RESTAURANT SHOULDNT BE ALLOWED BY CUSTOMER
                        .requestMatchers("/api/restaurant/**").hasAnyRole("RESTAURANT", "CUSTOMER") 
                        .requestMatchers("/api/auth/admin").hasRole("ADMIN")
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/couriers/available").hasAnyRole("RESTAURANT","ADMIN")
                        .requestMatchers("/api/order/finish-order").hasRole("CUSTOMER")
                        .requestMatchers("/api/restaurant/orders/*/status").hasRole("RESTAURANT")
                        .requestMatchers("/api/restaurant/orders/*/assign-courier/*").hasRole("RESTAURANT")
                        .requestMatchers("/api/menu/**").hasRole("RESTAURANT")
                        .requestMatchers("/api/customer/update-order/*").hasRole("CUSTOMER")
                        .requestMatchers("/api/customer/get-order").hasRole("CUSTOMER")
                        .requestMatchers("/api/order/courier/orders").hasRole("COURIER")
                        .requestMatchers("/api/couriers/**").hasAnyRole("COURIER", "CUSTOMER", "ADMIN")
                        .requestMatchers("/api/customer/**").hasRole("CUSTOMER")
                        .requestMatchers("/api/order/re-order/*").hasRole("CUSTOMER")
                        .requestMatchers("/api/auth/**").hasAnyRole("CUSTOMER", "ADMIN", "RESTAURANT", "COURIER")
                        .requestMatchers("/api/order/**").hasAnyRole("ADMIN", "RESTAURANT", "COURIER")
                        .anyRequest().authenticated()
                )
                .sessionManagement(x -> x.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .logout(x -> {
                    x.logoutUrl("/api/auth/logout");
                    x.addLogoutHandler(logoutHandler);
                    x.logoutSuccessHandler(((request, response, authentication) -> SecurityContextHolder.clearContext()));
                })
                .build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authenticationProvider = new DaoAuthenticationProvider();
        authenticationProvider.setUserDetailsService(authenticationService);
        authenticationProvider.setPasswordEncoder(passwordEncoder);
        return authenticationProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}