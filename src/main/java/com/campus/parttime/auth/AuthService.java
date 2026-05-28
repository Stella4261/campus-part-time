package com.campus.parttime.auth;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.campus.parttime.common.JwtUtil;
import com.campus.parttime.common.Result;
import com.campus.parttime.entity.*;
import com.campus.parttime.mapper.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.DigestUtils;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    @Autowired private UserMapper userMapper;
    @Autowired private StudentMapper studentMapper;
    @Autowired private EmployerMapper employerMapper;
    @Autowired private JwtUtil jwtUtil;

    public Result<?> login(LoginRequest req) {
        String md5pwd = DigestUtils.md5DigestAsHex(req.getPassword().getBytes());
        User user = userMapper.selectOne(
                new LambdaQueryWrapper<User>()
                        .eq(User::getUsername, req.getUsername())
                        .eq(User::getPassword, md5pwd)
        );
        if (user == null) return Result.error("用户名或密码错误");
        if (user.getStatus() == 0) return Result.error("账号已被禁用");

        String token = jwtUtil.generateToken(user.getId(), user.getRole());
        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("role", user.getRole());
        data.put("userId", user.getId());
        return Result.success(data);
    }

    @Transactional
    public Result<?> register(RegisterRequest req) {
        // 检查用户名是否重复
        Long count = userMapper.selectCount(
                new LambdaQueryWrapper<User>().eq(User::getUsername, req.getUsername())
        );
        if (count > 0) return Result.error("用户名已存在");

        // 创建user
        User user = new User();
        user.setUsername(req.getUsername());
        user.setPassword(DigestUtils.md5DigestAsHex(req.getPassword().getBytes()));
        user.setRole(req.getRole());
        user.setEmail(req.getEmail());
        user.setPhone(req.getPhone());
        user.setStatus(1);
        userMapper.insert(user);

        // 注册保存 user 后，根据角色创建子表记录
        if (req.getRole() == 1) {
            // 学生
            Student student = new Student();
            student.setUserId(user.getId());
            student.setUsername(req.getUsername());
            student.setRealName(req.getRealName());
            student.setSchool(req.getSchool());
            student.setMajor(req.getMajor());
            student.setGrade(req.getGrade());
            studentMapper.insert(student);
        } else if (req.getRole() == 2) {
            // 企业
            Employer employer = new Employer();
            employer.setUserId(user.getId());
            employer.setCompanyName(req.getCompanyName());
            employer.setContactName(req.getContactName());
            employer.setIndustry(req.getIndustry());
            employer.setVerifyStatus(0);
            employerMapper.insert(employer);
        }
        return Result.success("注册成功，请登录");
    }
}