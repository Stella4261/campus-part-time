package com.campus.parttime.employer;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.campus.parttime.common.Result;
import com.campus.parttime.entity.*;
import com.campus.parttime.mapper.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class EmployerServiceImpl implements EmployerService {

    @Autowired private EmployerMapper employerMapper;
    @Autowired private JobMapper jobMapper;
    @Autowired private ApplicationMapper applicationMapper;

    private Employer getEmployerByUserId(Long userId) {
        return employerMapper.selectOne(
                new LambdaQueryWrapper<Employer>().eq(Employer::getUserId, userId)
        );
    }

    /** 获取企业信息 */
    @Override
    public Result<?> getProfile(Long userId) {
        Employer employer = getEmployerByUserId(userId);
        if (employer == null) return Result.error("企业信息不存在");
        return Result.success(employer);
    }

    /** 更新企业信息 */
    @Override
    public Result<?> updateProfile(Long userId, Employer employer) {
        Employer exist = getEmployerByUserId(userId);
        if (exist == null) return Result.error("企业信息不存在");
        employer.setId(exist.getId());
        employer.setUserId(userId);
        employer.setVerifyStatus(exist.getVerifyStatus()); // 不允许自己改审核状态
        employerMapper.updateById(employer);
        return Result.success("更新成功");
    }

    /** 我发布的岗位列表 */
    @Override
    public Result<?> getMyJobs(Long userId, int page, int size) {
        Employer employer = getEmployerByUserId(userId);
        if (employer == null) return Result.error("企业信息不存在");

        Page<Job> pageResult = jobMapper.selectPage(
                new Page<>(page, size),
                new LambdaQueryWrapper<Job>()
                        .eq(Job::getEmployerId, employer.getId())
                        .orderByDesc(Job::getCreatedAt)
        );

        List<Job> list = pageResult.getRecords();
        if (list == null) {
            list = new ArrayList<>();
        }

        return Result.success(list);
    }

    /** 发布新岗位 */
    @Override
    public Result<?> createJob(Long userId, Job job) {
        Employer employer = getEmployerByUserId(userId);
        if (employer == null) return Result.error("企业信息不存在");
        if (employer.getVerifyStatus() != 1) return Result.error("企业尚未通过认证，不能发布岗位");

        job.setEmployerId(employer.getId());
        job.setStatus(0); // 新发布的岗位默认待审核
        jobMapper.insert(job);
        return Result.success("发布成功，等待管理员审核");
    }

    /** 修改岗位信息（只能改待审核或招募中的） */
    @Override
    public Result<?> updateJob(Long userId, Long jobId, Job job) {
        Employer employer = getEmployerByUserId(userId);
        if (employer == null) return Result.error("企业信息不存在");

        Job exist = jobMapper.selectById(jobId);
        if (exist == null) return Result.error("岗位不存在");
        if (!exist.getEmployerId().equals(employer.getId())) return Result.error("无权操作");
        if (exist.getStatus() == 2) return Result.error("已下架的岗位不能修改");

        job.setId(jobId);
        job.setEmployerId(employer.getId());
        job.setStatus(0); // 修改后重新待审核
        jobMapper.updateById(job);
        return Result.success("修改成功，等待重新审核");
    }

    /** 下架岗位 */
    @Override
    public Result<?> closeJob(Long userId, Long jobId) {
        Employer employer = getEmployerByUserId(userId);
        if (employer == null) return Result.error("企业信息不存在");

        Job job = jobMapper.selectById(jobId);
        if (job == null) return Result.error("岗位不存在");
        if (!job.getEmployerId().equals(employer.getId())) return Result.error("无权操作");

        job.setStatus(2);
        jobMapper.updateById(job);
        return Result.success("已下架");
    }

    /** 查看某个岗位的申请列表 */
    @Override
    public Result<?> getApplicationsByJob(Long userId, Long jobId) {
        Employer employer = getEmployerByUserId(userId);
        if (employer == null) return Result.error("企业信息不存在");

        Job job = jobMapper.selectById(jobId);
        if (job == null || !job.getEmployerId().equals(employer.getId())) return Result.error("无权查看");

        var list = applicationMapper.selectList(
                new LambdaQueryWrapper<Application>()
                        .eq(Application::getJobId, jobId)
                        .ne(Application::getStatus, 3) // 不显示已撤回的
                        .orderByAsc(Application::getCreatedAt)
        );
        return Result.success(list);
    }

    /** 处理申请（录用/拒绝） */
    @Override
    public Result<?> handleApplication(Long userId, Long applicationId, Integer status) {
        if (status != 1 && status != 2) return Result.error("状态参数有误，1=录用 2=拒绝");

        Employer employer = getEmployerByUserId(userId);
        if (employer == null) return Result.error("企业信息不存在");

        Application app = applicationMapper.selectById(applicationId);
        if (app == null) return Result.error("申请不存在");

        // 验证这个申请属于该企业的岗位
        Job job = jobMapper.selectById(app.getJobId());
        if (job == null || !job.getEmployerId().equals(employer.getId())) return Result.error("无权操作");
        if (app.getStatus() != 0) return Result.error("只能处理待处理状态的申请");

        app.setStatus(status);
        applicationMapper.updateById(app);
        return Result.success(status == 1 ? "已录用" : "已拒绝");
    }
}