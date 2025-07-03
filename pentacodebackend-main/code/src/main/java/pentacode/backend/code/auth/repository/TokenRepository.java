package pentacode.backend.code.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

import pentacode.backend.code.auth.entity.Token;

public interface TokenRepository extends JpaRepository<Token, Long> {
    // write find by user token with sql query
    @Query("select t from Token t where t.user_token = :userToken")
    Optional<Token> findByUserToken(String userToken);

    @Query("""
                    select t from Token t inner join User u on t.user.id = u.id
                    where u.id = :userId and (t.expired = false or t.revoked = false)
            """)
    List<Token> findAllValidTokensByUser(Long userId);
}
