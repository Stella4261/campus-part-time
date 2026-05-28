package com.campus.parttime.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.campus.parttime.entity.Student;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface StudentMapper extends BaseMapper<Student> {
}