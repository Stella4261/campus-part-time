package com.campus.parttime.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

@Data
@TableName("job_category")
public class JobCategory {
    @TableId(type = IdType.AUTO)
    private Integer id;
    private String name;
}