package com.hisabloop.notification;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRecordRepository extends JpaRepository<NotificationRecord, String> {

    List<NotificationRecord> findTop50ByCompanyIdAndUserIdAndChannelOrderByCreatedAtDesc(String companyId, String userId,
            String channel);
}
