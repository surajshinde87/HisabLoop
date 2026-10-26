package com.hisabloop.company;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SubscriptionRepository extends JpaRepository<Subscription, String> {

    Optional<Subscription> findFirstByCompanyIdAndStatusOrderByStartedAtDesc(String companyId, String status);
}
