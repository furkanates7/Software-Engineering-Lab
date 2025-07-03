package pentacode.backend.code.courier.service;

import java.io.File;
import java.io.IOException;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import pentacode.backend.code.common.dto.ReviewDTO;
import pentacode.backend.code.common.entity.Order;
import pentacode.backend.code.common.entity.Review;
import pentacode.backend.code.common.repository.OrderRepository;
import pentacode.backend.code.common.repository.ReviewRepository;
import pentacode.backend.code.common.service.base.BaseService;
import pentacode.backend.code.courier.dto.CourierDTO;
import pentacode.backend.code.courier.entity.Courier;
import pentacode.backend.code.courier.mapper.CourierMapper;
import pentacode.backend.code.courier.repository.CourierRepository;
import pentacode.backend.code.customer.entity.Customer;

@Service
public class CourierService extends BaseService<Courier> {
    private final CourierRepository courierRepository;
    private final CourierMapper courierMapper;
    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;

    public CourierService(CourierRepository courierRepository, CourierMapper courierMapper, ReviewRepository reviewRepository, OrderRepository orderRepository) {
        super(courierRepository);
        this.courierRepository = courierRepository;
        this.courierMapper = courierMapper;
        this.reviewRepository = reviewRepository;
        this.orderRepository = orderRepository;
    }

    public List<CourierDTO> getAvailableCouriers() {
        return courierMapper.mapToListDTO(courierRepository.findByIsOnlineAndIsAvailable(true, true));
    }

    public CourierDTO getByPk(Long pk) {
        return courierMapper.mapToDTO(super.findByPkOr404(pk));
    }

    public CourierDTO updateCourier(Long pk, CourierDTO dto) {
        Courier courier = findByPkOr404(pk);

        if (dto.getName() != null && !dto.getName().trim().isEmpty()) {
            courier.setName(dto.getName());
        }
        if (dto.getPhoneNumber() != null && !dto.getPhoneNumber().trim().isEmpty()) {
            courier.setPhoneNumber(dto.getPhoneNumber());
        }
            courier.setAvailable(dto.isAvailable());
            courier.setOnline(dto.isOnline());
        
        Courier savedCourier = courierRepository.save(courier);
        return courierMapper.mapToDTO(savedCourier);
    }

    public CourierDTO updateProfilePicture(Long pk, MultipartFile file) {
        Courier courier = super.findByPkOr404(pk);

        try {
            String filename = pk + "_" + file.getOriginalFilename();
            String uploadDir = new File("src/main/resources/static/images").getAbsolutePath(); // writable dir in project root
            File saveFile = new File(uploadDir, filename);
            file.transferTo(saveFile); // saves the file

            // Expose file via URL
            String profilePictureUrl = "http://localhost:8080/images/" + filename;
            courier.setProfilePictureUrl(profilePictureUrl);
            courierRepository.save(courier);
            return courierMapper.mapToDTO(courier);
        } catch (IOException e) {
            throw new RuntimeException("Failed to save file", e);
        }
        
    }

    public List<CourierDTO> getAllCouriers() {
        List<Courier> couriers = courierRepository.findAllByDeletedFalse();
        return courierMapper.mapToListDTO(couriers);
    }

    // rate courier
    public CourierDTO rateCourier(Long orderPk, Integer rating, ReviewDTO reviewDTO, Customer customer) {
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
        Order order = orderRepository.findByPk(orderPk);
        orderRepository.save(order);
        String reviewText = reviewDTO.getReviewText();
        Courier courier = order.getCourier();

        Review review = Review.builder()
                .reviewText(reviewText)
                .rating(rating)
                .courier(courier)
                .order2(order)
                .customer(customer)
                .restaurant(order.getRestaurant())
                .build();

        reviewRepository.save(review);
        

        Double newRating = (courier.getRating() + rating) / (courier.getRatingCount() + 1);
        courier.setRating(newRating);
        courier.setRatingCount(courier.getRatingCount() + 1);

        Courier savedCourier = courierRepository.save(courier);
        return courierMapper.mapToDTO(savedCourier);        
    }

    public ReviewDTO checkCourierReview(Long orderPk, Long courierPk) {
        Review review = reviewRepository.findByOrderIdAndCourierId(orderPk, courierPk);
        return review != null ? ReviewDTO.builder()
                .reviewText(review.getReviewText())
                .rating(review.getRating())
                .build() : null;
    }

    public void deleteCourierReview(Long reviewPk) {
        Review review = reviewRepository.findByPk(reviewPk);
        if (review == null) {
            throw new IllegalArgumentException("Review not found");
        }
        Courier courier = review.getCourier();
        if (courier.getRatingCount() > 1) {
            Double newRating = (courier.getRating() * courier.getRatingCount() - review.getRating()) / (courier.getRatingCount() - 1);
            courier.setRating(newRating);
            courier.setRatingCount(courier.getRatingCount() - 1);
        }
        else {
            courier.setRating(0.0);
            courier.setRatingCount(0);
        }
        courierRepository.save(courier);
        reviewRepository.delete(review);
    }

    public ReviewDTO updateCourierReview(Long reviewPk, ReviewDTO reviewDTO) {
        Review review = reviewRepository.findByPk(reviewPk);
        if (review == null) {
            throw new IllegalArgumentException("Review not found");
        }
        int oldRating = review.getRating();
        review.setReviewText(reviewDTO.getReviewText());
        review.setRating(reviewDTO.getRating());
        Courier courier = review.getCourier();
        courier.setRating((courier.getRating() * courier.getRatingCount() - oldRating + review.getRating()) / (courier.getRatingCount()));
        courierRepository.save(courier);
        reviewRepository.save(review);
        return ReviewDTO.builder()
                .reviewText(review.getReviewText())
                .rating(review.getRating())
                .pk(review.getPk())
                .courier(courierMapper.mapToDTO(courier))
                .build();
    }   

    public CourierDTO updateStatus(Courier courier) {
        courier.setAvailable(!courier.isAvailable());
        courierRepository.save(courier);
        return courierMapper.mapToDTO(courier);
    }

}