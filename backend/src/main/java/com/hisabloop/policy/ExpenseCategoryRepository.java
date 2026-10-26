package com.hisabloop.policy;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpenseCategoryRepository extends JpaRepository<ExpenseCategory, String> {

    List<ExpenseCategory> findAllByOrderBySortOrder();
}
