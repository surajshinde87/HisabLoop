package com.hisabloop.policy;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpensePolicyRepository extends JpaRepository<ExpensePolicy, String> {

    Optional<ExpensePolicy> findByCompanyId(String companyId);
}
