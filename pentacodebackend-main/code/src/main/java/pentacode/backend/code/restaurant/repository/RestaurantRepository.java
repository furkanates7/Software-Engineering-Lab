package pentacode.backend.code.restaurant.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import pentacode.backend.code.common.repository.base.BaseRepository;
import pentacode.backend.code.restaurant.entity.Restaurant;

public interface RestaurantRepository extends BaseRepository<Restaurant> {
    List<Restaurant> findByName(String name);
    
    Restaurant findByPk(Long pk);

    @Query("SELECT r FROM Restaurant r " +
           "WHERE (:search IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(r.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY " +
           "CASE WHEN :sort = 'name-asc' THEN r.name END ASC, " +
           "CASE WHEN :sort = 'name-desc' THEN r.name END DESC")
    List<Restaurant> findRestaurantsWithFilters(
            @Param("search") String search,
            @Param("sort") String sort);
    
    List<Restaurant> findByNameAndDeletedFalse(String name);
    Restaurant findByPkAndDeletedFalse(Long pk);
    List<Restaurant> findAllByDeletedFalse();
}