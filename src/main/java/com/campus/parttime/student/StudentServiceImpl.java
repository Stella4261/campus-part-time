package com.campus.parttime.student;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.campus.parttime.common.Result;
import com.campus.parttime.entity.*;
import com.campus.parttime.mapper.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;  // ← 添加这行

@Service
public class StudentServiceImpl implements StudentService {

    @Autowired private StudentMapper studentMapper;
    @Autowired private JobMapper jobMapper;
    @Autowired private ApplicationMapper applicationMapper;
    @Autowired private EmployerMapper employerMapper;

    /** 获取学生个人信息 */
    @Override
    public Result<?> getProfile(Long userId) {
        Student student = studentMapper.selectOne(
                new LambdaQueryWrapper<Student>().eq(Student::getUserId, userId)
        );
        if (student == null) return Result.error("学生信息不存在");
        return Result.success(student);
    }

    /** 更新学生个人信息 */
    @Override
    public Result<?> updateProfile(Long userId, Student student) {
        Student exist = studentMapper.selectOne(
                new LambdaQueryWrapper<Student>().eq(Student::getUserId, userId)
        );
        if (exist == null) return Result.error("学生信息不存在");
        student.setId(exist.getId());
        student.setUserId(userId); // 不允许修改userId
        studentMapper.updateById(student);
        return Result.success("更新成功");
    }

    /** 分页获取兼职列表（支持关键字+分类筛选） */
    @Override
    public Result<?> getJobList(int page, int size, String keyword, Integer categoryId, Integer status) {
        LambdaQueryWrapper<Job> wrapper = new LambdaQueryWrapper<>();
        if (keyword != null && !keyword.isEmpty())
            wrapper.like(Job::getTitle, keyword);
        if (categoryId != null)
            wrapper.eq(Job::getCategoryId, categoryId);
        if (status != null)
            wrapper.eq(Job::getStatus, status);
        wrapper.orderByDesc(Job::getCreatedAt);

        List<Job> jobs = jobMapper.selectList(wrapper);

        // 确保返回空数组而不是 null
        if (jobs == null) {
            jobs = List.of();  // 或者 new ArrayList<>()
        }

        return Result.success(jobs);
    }

    /** 获取岗位详情 */
    @Override
    public Result<?> getJobDetail(Long jobId) {
        Job job = jobMapper.selectById(jobId);
        if (job == null) return Result.error("岗位不存在");
        return Result.success(job);
    }

    /** 投递简历 */
    @Override
    public Result<?> applyJob(Long userId, Long jobId, String coverLetter) {
        // 找到studentId
        Student student = studentMapper.selectOne(
                new LambdaQueryWrapper<Student>().eq(Student::getUserId, userId)
        );
        if (student == null) return Result.error("请先完善个人信息");

        // 检查岗位是否存在且招募中
        Job job = jobMapper.selectById(jobId);
        if (job == null || job.getStatus() != 1) return Result.error("该岗位不在招募中");

        // 检查是否已经投递过
        Long count = applicationMapper.selectCount(
                new LambdaQueryWrapper<Application>()
                        .eq(Application::getJobId, jobId)
                        .eq(Application::getStudentId, student.getId())
                        .ne(Application::getStatus, 3) // 撤回的可以重新投
        );
        if (count > 0) return Result.error("已投递过该岗位，请勿重复投递");

        Application app = new Application();
        app.setJobId(jobId);
        app.setStudentId(student.getId());
        app.setCoverLetter(coverLetter);
        app.setStatus(0);
        applicationMapper.insert(app);
        return Result.success("投递成功");
    }

    /** 查看我的投递记录 */
    @Override
    public Result<?> getMyApplications(Long userId) {
        Student student = studentMapper.selectOne(
                new LambdaQueryWrapper<Student>().eq(Student::getUserId, userId)
        );
        if (student == null) return Result.error("学生信息不存在");

        List<Application> list = applicationMapper.selectList(  // ← 加上 List<Application>
                new LambdaQueryWrapper<Application>()
                        .eq(Application::getStudentId, student.getId())
                        .orderByDesc(Application::getCreatedAt)
        );

        if (list == null) {
            list = List.of();
        }

        return Result.success(list);
    }

    /** 撤回投递 */
    @Override
    public Result<?> cancelApplication(Long userId, Long applicationId) {
        Student student = studentMapper.selectOne(
                new LambdaQueryWrapper<Student>().eq(Student::getUserId, userId)
        );
        if (student == null) return Result.error("学生信息不存在");

        Application app = applicationMapper.selectById(applicationId);
        if (app == null) return Result.error("投递记录不存在");
        if (!app.getStudentId().equals(student.getId())) return Result.error("无权操作");
        if (app.getStatus() != 0) return Result.error("只有待处理的申请才能撤回");

        app.setStatus(3);
        applicationMapper.updateById(app);
        return Result.success("撤回成功");
    }
}