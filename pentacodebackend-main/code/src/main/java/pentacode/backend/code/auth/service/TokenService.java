package pentacode.backend.code.auth.service;

import org.springframework.stereotype.Service;

import pentacode.backend.code.auth.repository.TokenRepository;

@Service
public class TokenService {
    // check if token is valid
    private final TokenRepository tokenRepository;
    
    public TokenService(TokenRepository tokenRepository) {
        this.tokenRepository = tokenRepository;
    }

    public boolean isTokenValid(String token) {
        var storedToken = tokenRepository.findByUserToken(token);
        System.out.println("Stored token: " + storedToken);
        return !storedToken.get().isExpired() && !storedToken.get().isRevoked();
    }
}
