package com.rapidrise.filesharingapp.controller;

import com.rapidrise.filesharingapp.dto.ResponseStructure;
import com.rapidrise.filesharingapp.dto.response.NotificationResponse;
import com.rapidrise.filesharingapp.dto.response.UnreadNotificationCountResponse;
import com.rapidrise.filesharingapp.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ResponseStructure<List<NotificationResponse>>>
    getMyNotifications(
            @RequestParam(defaultValue = "20") int limit
    ) {
        return notificationService.getMyNotifications(limit);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ResponseStructure<UnreadNotificationCountResponse>>
    getUnreadCount() {
        return notificationService.getUnreadCount();
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ResponseStructure<String>>
    markAsRead(@PathVariable Long id) {
        return notificationService.markAsRead(id);
    }

    @PutMapping("/read-all")
    public ResponseEntity<ResponseStructure<String>>
    markAllAsRead() {
        return notificationService.markAllAsRead();
    }
}
