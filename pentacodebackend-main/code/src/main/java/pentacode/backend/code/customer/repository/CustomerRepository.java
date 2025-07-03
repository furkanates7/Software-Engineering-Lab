package pentacode.backend.code.customer.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;

import pentacode.backend.code.common.repository.base.BaseRepository;
import pentacode.backend.code.customer.dto.CustomerDTO;
import pentacode.backend.code.customer.entity.Customer;
import pentacode.backend.code.restaurant.entity.Restaurant;

public interface  CustomerRepository extends BaseRepository<Customer> {
    Optional<Customer> findByName(String name);
    Optional<Customer> findByEmail(String email);
    Customer findByPk(Long pk);
    Optional<Customer> findByNameAndDeletedFalse(String name);
    Optional<Customer> findByEmailAndDeletedFalse(String email);
    Customer findByPkAndDeletedFalse(Long pk);
    List<Customer> findAllByDeletedFalse();
}
