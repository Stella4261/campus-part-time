package com.campus.parttime.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.campus.parttime.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {}