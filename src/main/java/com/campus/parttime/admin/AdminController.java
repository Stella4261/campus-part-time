package com.campus.parttime.admin;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.campus.parttime.common.Result;
import com.campus.parttime.entity.Employer;
import com.campus.parttime.entity.Job;
import com.campus.parttime.entity.Student;
import com.campus.parttime.entity.User;
import com.campus.parttime.mapper.EmployerMapper;
import com.campus.parttime.mapper.JobMapper;
import com.campus.parttime.mapper.StudentMapper;
import com.campus.parttime.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserMapper userMapper;
    private final JobMapper jobMapper;
    private final EmployerMapper employerMapper;
    private final StudentMapper studentMapper;  // 新增

    // 用户列表（已修改：合并学生/企业扩展字段）
    @GetMapping("/users")
    public Result getUserList(
            @RequestParam(required = false) Integer role,
            @RequestParam(required = false) Integer status) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        if (role != null) wrapper.eq(User::getRole, role);
        if (status != null) wrapper.eq(User::getStatus, status);
        wrapper.orderByDesc(User::getCreatedAt);
        List<User> users = userMapper.selectList(wrapper);
        List<Map<String, Object>> result = new ArrayList<>();

        for (User u : users) {
            Map<String, Object> map = new LinkedHashMap<>();
            // 基础信息（user表）
            map.put("id", String.valueOf(u.getId()));
            map.put("username", u.getUsername());
            map.put("role", u.getRole());
            map.put("email", u.getEmail());
            map.put("phone", u.getPhone());
            map.put("status", u.getStatus());
            map.put("createdAt", u.getCreatedAt());

            // 根据角色补充扩展信息
            if (u.getRole() == 1) { // 学生
                Student student = studentMapper.selectOne(
                        new LambdaQueryWrapper<Student>().eq(Student::getUserId, u.getId())
                );
                if (student != null) {
                    map.put("realName", student.getRealName());
                    map.put("studentNo", student.getStudentNo());
                    map.put("school", student.getSchool());
                    map.put("major", student.getMajor());
                    map.put("grade", student.getGrade());
                    map.put("resume", student.getResume());
                } else {
                    // 没找到学生记录时给默认值
                    map.put("realName", "");
                    map.put("studentNo", "");
                    map.put("school", "");
                    map.put("major", "");
                    map.put("grade", "");
                    map.put("resume", "");
                }
            } else if (u.getRole() == 2) { // 企业
                Employer employer = employerMapper.selectOne(
                        new LambdaQueryWrapper<Employer>().eq(Employer::getUserId, u.getId())
                );
                if (employer != null) {
                    map.put("companyName", employer.getCompanyName());
                    map.put("contactName", employer.getContactName());
                    map.put("industry", employer.getIndustry());
                    map.put("address", employer.getAddress());
                    map.put("description", employer.getDescription());
                    map.put("verifyStatus", employer.getVerifyStatus());
                } else {
                    map.put("companyName", "");
                    map.put("contactName", "");
                    map.put("industry", "");
                    map.put("address", "");
                    map.put("description", "");
                    map.put("verifyStatus", "");
                }
            }
            // role == 0 管理员没有扩展字段，不额外添加

            result.add(map);
        }
        return Result.success(result);
    }

    // 启用禁用用户
    @PutMapping("/users/{id}/status")
    public Result updateUserStatus(@PathVariable Long id,
                                   @RequestBody Map<String, Integer> body) {
        Integer status = body.get("status");
        User user = userMapper.selectById(id);
        if (user == null) return Result.error("用户不存在");
        if (user.getRole() == 0) return Result.error("不能操作管理员");
        LambdaUpdateWrapper<User> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(User::getId, id).set(User::getStatus, status);
        userMapper.update(null, wrapper);
        return Result.success(status == 0 ? "已禁用" : "已启用");
    }

    // 岗位列表（管理员审核用）
    @GetMapping("/jobs")
    public Result getJobList(@RequestParam(required = false) Integer status) {
        LambdaQueryWrapper<Job> wrapper = new LambdaQueryWrapper<>();
        if (status != null) wrapper.eq(Job::getStatus, status);
        wrapper.orderByDesc(Job::getCreatedAt);
        List<Job> jobs = jobMapper.selectList(wrapper);
        return Result.success(jobs);
    }

    // 审核岗位
    @PutMapping("/jobs/{id}/audit")
    public Result auditJob(@PathVariable Long id,
                           @RequestBody Map<String, Integer> body) {
        Integer status = body.get("status");
        if (status == null || (status != 1 && status != 3))
            return Result.error("状态值非法");
        Job job = jobMapper.selectById(id);
        if (job == null) return Result.error("岗位不存在");
        LambdaUpdateWrapper<Job> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(Job::getId, id).set(Job::getStatus, status);
        jobMapper.update(null, wrapper);
        return Result.success(status == 1 ? "审核通过" : "已拒绝");
    }

    // 企业列表（保留了原有的单独企业列表接口）
    @GetMapping("/employers")
    public Result getEmployerList(
            @RequestParam(required = false) Integer verifyStatus) {
        LambdaQueryWrapper<Employer> wrapper = new LambdaQueryWrapper<>();
        if (verifyStatus != null)
            wrapper.eq(Employer::getVerifyStatus, verifyStatus);
        List<Employer> employers = employerMapper.selectList(wrapper);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Employer e : employers) {
            User user = userMapper.selectById(e.getUserId());
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", String.valueOf(e.getId()));
            map.put("userId", String.valueOf(e.getUserId()));
            map.put("username", user != null ? user.getUsername() : "");
            map.put("companyName", e.getCompanyName());
            map.put("contactName", e.getContactName());
            map.put("industry", e.getIndustry());
            map.put("verifyStatus", e.getVerifyStatus());
            result.add(map);
        }
        return Result.success(result);
    }

    // 审核企业
    @PutMapping("/employers/{id}/verify")
    public Result verifyEmployer(@PathVariable Long id,
                                 @RequestBody Map<String, Integer> body) {
        Integer verifyStatus = body.get("verifyStatus");
        if (verifyStatus == null || (verifyStatus != 1 && verifyStatus != 2))
            return Result.error("状态值非法");
        Employer employer = employerMapper.selectById(id);
        if (employer == null) return Result.error("企业不存在");
        LambdaUpdateWrapper<Employer> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(Employer::getId, id)
                .set(Employer::getVerifyStatus, verifyStatus);
        employerMapper.update(null, wrapper);
        return Result.success(verifyStatus == 1 ? "认证通过" : "已拒绝");
    }
}