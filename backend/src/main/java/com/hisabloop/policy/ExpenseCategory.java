package com.hisabloop.policy;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import org.hibernate.annotations.Immutable;

@Getter
@Setter
@Entity
@Immutable
@Table(name = "expense_categories")
public class ExpenseCategory {

    @Id
    @Column(length = 40)
    private String code;

    @Column(nullable = false, length = 80)
    private String label;

    @Column(nullable = false, length = 40)
    private String icon;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;
}
