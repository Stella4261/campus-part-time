package com.campus.parttime.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

@Data
@TableName("student")
public class Student {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private String username;
    private String realName;
    private String studentNo;
    private String school;
    private String major;
    private String grade;
    private String resume;
}