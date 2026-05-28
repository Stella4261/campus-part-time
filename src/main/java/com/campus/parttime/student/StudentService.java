package com.campus.parttime.student;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.campus.parttime.common.Result;
import com.campus.parttime.entity.Job;
import com.campus.parttime.entity.Student;

public interface StudentService {
    Result<?> getProfile(Long userId);
    Result<?> updateProfile(Long userId, Student student);
    Result<?> getJobList(int page, int size, String keyword, Integer categoryId, Integer status);
    Result<?> getJobDetail(Long jobId);
    Result<?> applyJob(Long userId, Long jobId, String coverLetter);
    Result<?> getMyApplications(Long userId);
    Result<?> cancelApplication(Long userId, Long applicationId);
}