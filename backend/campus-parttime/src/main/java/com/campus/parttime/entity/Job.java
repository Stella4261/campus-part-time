package com.campus.parttime.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("job")
public class Job {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long employerId;
    private Integer categoryId;
    private String title;
    private String description;
    private String requirement;
    private BigDecimal salary;
    private Integer salaryType;
    private String location;
    private Integer headcount;
    private String workTime;
    private LocalDate deadline;
    private Integer status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}