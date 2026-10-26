package com.hisabloop.team;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import com.hisabloop.common.persistence.BaseEntity;

@Getter
@Setter
@Entity
@Table(name = "teams")
public class Team extends BaseEntity {

    @Column(name = "company_id", nullable = false, length = 36)
    private String companyId;

    @Column(nullable = false, length = 80)
    private String name;
}
