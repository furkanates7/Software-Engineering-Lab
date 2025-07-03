package pentacode.backend.code.courier.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import pentacode.backend.code.auth.entity.User;
import pentacode.backend.code.common.dto.OrderDTO;
import pentacode.backend.code.common.entity.Order;
import pentacode.backend.code.common.entity.OrderStatusEnum;
import pentacode.backend.code.common.repository.OrderRepository;
import pentacode.backend.code.common.service.OrderService;
import pentacode.backend.code.common.utils.ResponseHandler;
import pentacode.backend.code.courier.entity.Courier;

@RestController
@RequestMapping("/api/couriers")
public class CourierAssignmentController {
    private final OrderService orderService;
    private final OrderRepository orderRepository;
    
    public CourierAssignmentController(OrderService orderService, OrderRepository orderRepository) {
        this.orderService = orderService;
        this.orderRepository = orderRepository;
    }
    
    @PostMapping("/orders/{orderId}/respond")
    public ResponseEntity<Object> respondToAssignment(@AuthenticationPrincipal User user,
                                                     @PathVariable("orderId") Long orderId,
                                                     @RequestParam("status") String status) {
        try {
            Long courierId = user.getCourier().getPk();
            OrderDTO order = orderService.getByPk(orderId);
            
            Courier courier = user.getCourier();
            // for all of the orders courier have, beside the order id reject all of the assigned orders
            List<Order> orders = orderRepository.findByCourierPk(courierId);
            
            System.out.println(orders);

            for (Order order1 : orders) {
                System.out.println("ananızın amcıgı");
                if (!order1.getPk().equals(orderId) && OrderStatusEnum.ASSIGNED.equals(order1.getStatus())) {
                    order1.setStatus(OrderStatusEnum.READY_FOR_PICKUP);
                    orderRepository.save(order1);
                }
            }


            courier.setAvailable(false);
            
            if (order == null || order.getCourier() == null || !order.getCourier().getPk().equals(courierId)) {
                return ResponseHandler.generatePkResponse("Invalid order or courier", 
                                                        HttpStatus.BAD_REQUEST, 
                                                        null);
            }
            
            OrderDTO updatedOrder = orderService.courierAcceptAssignment(orderId, status);
            return ResponseHandler.generatePkResponse("Assignment accepted successfully", 
                                                    HttpStatus.OK, 
                                                    updatedOrder);
            
        } catch (Exception e) {
            return ResponseHandler.generatePkResponse("Assignment rejected", 
                                                    HttpStatus.BAD_REQUEST, 
                                                    null);
        }
    }
}