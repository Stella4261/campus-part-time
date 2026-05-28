package com.campus.parttime.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("application")
public class Application {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long jobId;
    private Long studentId;
    private String coverLetter;
    private Integer status;   // 0待处理 1已录用 2已拒绝 3已撤回
    // 新增字段
    private String realName;
    private String phone;
    private String email;
    private String school;
    private String major;
    private String degree;
    private String graduationYear;
    private String skills;
    private String experience;
    private String selfIntro;
    private String resumeUrl;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}