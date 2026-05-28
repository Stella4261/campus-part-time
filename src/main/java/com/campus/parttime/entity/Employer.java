package com.campus.parttime.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

@Data
@TableName("employer")
public class Employer {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private String companyName;
    private String contactName;
    private String industry;
    private String address;
    private String description;
    private Integer verifyStatus;  // 0待审核 1已认证 2已拒绝
}