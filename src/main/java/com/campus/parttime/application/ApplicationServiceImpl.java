package com.campus.parttime.application;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.campus.parttime.common.Result;
import com.campus.parttime.entity.*;
import com.campus.parttime.mapper.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.stream.Collectors;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationMapper applicationMapper;
    private final JobMapper jobMapper;
    private final StudentMapper studentMapper;
    private final EmployerMapper employerMapper;
    private final UserMapper userMapper;

    @Override
    public Result<?> apply(Long studentId, Map<String, Object> body) {
        Long jobId = Long.valueOf(body.get("jobId").toString());

        // 获取学生信息（用于校验）
        Student student = studentMapper.selectOne(
                new LambdaQueryWrapper<Student>()
                        .eq(Student::getUserId, studentId));
        if (student == null) return Result.error("学生信息不存在，请完善个人信息");

        // 检查是否重复投递
        Long count = applicationMapper.selectCount(
                new LambdaQueryWrapper<Application>()
                        .eq(Application::getJobId, jobId)
                        .eq(Application::getStudentId, student.getId()));
        if (count > 0) return Result.error("您已投递过该岗位");

        // 创建投递记录
        Application app = new Application();
        app.setJobId(jobId);
        app.setStudentId(student.getId());

        // 保存投递时填写的所有信息
        app.setRealName((String) body.get("realName"));
        app.setPhone((String) body.get("phone"));
        app.setEmail((String) body.get("email"));
        app.setSchool((String) body.get("school"));
        app.setMajor((String) body.get("major"));
        app.setDegree((String) body.get("degree"));
        app.setGraduationYear((String) body.get("graduationYear"));
        app.setSkills((String) body.get("skills"));
        app.setExperience((String) body.get("experience"));
        app.setSelfIntro((String) body.get("selfIntro"));
        app.setCoverLetter((String) body.get("coverLetter"));
        app.setResumeUrl((String) body.get("resumeUrl"));  // 如果有上传简历

        app.setStatus(0);
        applicationMapper.insert(app);

        return Result.success("投递成功");
    }

    @Override
    public Result<?> getMyApplications(Long userId) {
        Student student = studentMapper.selectOne(
                new LambdaQueryWrapper<Student>()
                        .eq(Student::getUserId, userId));
        if (student == null) return Result.success(new ArrayList<>());

        List<Application> apps = applicationMapper.selectList(
                new LambdaQueryWrapper<Application>()
                        .eq(Application::getStudentId, student.getId())
                        .orderByDesc(Application::getCreatedAt));

        List<Map<String, Object>> result = new ArrayList<>();
        for (Application app : apps) {
            Job job = jobMapper.selectById(app.getJobId());
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", app.getId());
            map.put("jobId", app.getJobId());
            map.put("jobTitle", job != null ? job.getTitle() : "");
            map.put("status", app.getStatus());
            map.put("createdAt", app.getCreatedAt());
            result.add(map);
        }
        return Result.success(result);
    }

    @Override
    public Result withdraw(Long id, Long userId) {
        Student student = studentMapper.selectOne(
                new LambdaQueryWrapper<Student>()
                        .eq(Student::getUserId, userId));
        if (student == null) return Result.error("学生信息不存在");

        Application app = applicationMapper.selectById(id);
        if (app == null) return Result.error("投递记录不存在");
        if (!app.getStudentId().equals(student.getId()))
            return Result.error("无权操作");
        if (app.getStatus() != 0) return Result.error("该状态不可撤回");

        LambdaUpdateWrapper<Application> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(Application::getId, id).set(Application::getStatus, 3);
        applicationMapper.update(null, wrapper);
        return Result.success("已撤回");
    }

    @Override
    public Result<?> getReceived(Long userId) {
        Employer employer = employerMapper.selectOne(
                new LambdaQueryWrapper<Employer>()
                        .eq(Employer::getUserId, userId));
        if (employer == null) return Result.success(new ArrayList<>());

        List<Job> jobs = jobMapper.selectList(
                new LambdaQueryWrapper<Job>()
                        .eq(Job::getEmployerId, employer.getId()));
        if (jobs.isEmpty()) return Result.success(new ArrayList<>());

        List<Long> jobIds = jobs.stream().map(Job::getId).collect(Collectors.toList());

        List<Application> apps = applicationMapper.selectList(
                new LambdaQueryWrapper<Application>()
                        .in(Application::getJobId, jobIds)
                        .orderByDesc(Application::getCreatedAt));

        List<Map<String, Object>> result = new ArrayList<>();
        for (Application app : apps) {
            Job job = jobMapper.selectById(app.getJobId());

            //修改：直接从 application 表读取投递时填写的信息
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", app.getId());
            map.put("jobId", app.getJobId());
            map.put("jobTitle", job != null ? job.getTitle() : "");
            map.put("studentId", app.getStudentId());
            map.put("status", app.getStatus());
            map.put("createdAt", app.getCreatedAt());
            map.put("coverLetter", app.getCoverLetter());

            // 这些信息应该从 application 表读取，而不是 student 表
            map.put("studentName", app.getRealName() != null ? app.getRealName() : "未填写");
            map.put("phone", app.getPhone() != null ? app.getPhone() : "未填写");
            map.put("email", app.getEmail() != null ? app.getEmail() : "未填写");
            map.put("school", app.getSchool() != null ? app.getSchool() : "未填写");
            map.put("major", app.getMajor() != null ? app.getMajor() : "未填写");
            map.put("degree", app.getDegree() != null ? app.getDegree() : "未填写");
            map.put("graduationYear", app.getGraduationYear() != null ? app.getGraduationYear() : "未填写");
            map.put("skills", app.getSkills() != null ? app.getSkills() : "未填写");
            map.put("experience", app.getExperience() != null ? app.getExperience() : "未填写");
            map.put("selfIntro", app.getSelfIntro() != null ? app.getSelfIntro() : "未填写");
            map.put("resumeUrl", app.getResumeUrl() != null ? app.getResumeUrl() : "");

            result.add(map);
        }
        return Result.success(result);
    }

    @Override
    public Result handle(Long id, Integer status) {
        if (status == null || (status != 1 && status != 2))
            return Result.error("状态值非法");
        Application app = applicationMapper.selectById(id);
        if (app == null) return Result.error("记录不存在");
        if (app.getStatus() != 0) return Result.error("该申请已处理");

        LambdaUpdateWrapper<Application> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(Application::getId, id).set(Application::getStatus, status);
        applicationMapper.update(null, wrapper);
        return Result.success(status == 1 ? "已录用" : "已拒绝");
    }
}