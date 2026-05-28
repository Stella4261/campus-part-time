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
    private Integer salaryType;   // 0元/小时 1元/天 2元/月
    private String location;
    private Integer headcount;
    private String workTime;
    private LocalDate deadline;
    private Integer status;       // 0待审核 1招募中 2已下架 3审核拒绝
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}