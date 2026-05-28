package com.campus.parttime.auth;

import lombok.Data;

@Data
public class RegisterRequest {
    //基本字段
    private String username;
    private String password;
    private Integer role;       // 1学生 2企业 0管理员
    private String email;
    private String phone;
    // 学生额外字段
    private String realName;
    private String studentNo;
    private String school;
    private String major;
    private String grade;
    // 企业额外字段
    private String companyName;
    private String contactName;
    private String industry;
    private String address;
}