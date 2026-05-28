package com.campus.parttime;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.campus.parttime.mapper")
public class ParttimeApplication {
    public static void main(String[] args) {
        SpringApplication.run(ParttimeApplication.class, args);
    }
}