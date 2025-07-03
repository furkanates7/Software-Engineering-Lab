package pentacode.backend.code.restaurant.repository;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import pentacode.backend.code.common.repository.base.BaseRepository;
import pentacode.backend.code.restaurant.entity.Menu;


public interface MenuRepository extends BaseRepository<Menu> {
    List<Menu> findByRestaurantPk(Long restaurantPk);
    @Query("SELECT m FROM Menu m JOIN m.categories c WHERE m.restaurant.id = :restaurantPk AND c.name = :categoryName")
    List<Menu> findByRestaurantPkAndCategoryName(@Param("restaurantPk") Long restaurantPk, @Param("categoryName") String categoryName);

}