package com.rapidrise.filesharingapp.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UnreadNotificationCountResponse {

    private long unreadCount;
}
