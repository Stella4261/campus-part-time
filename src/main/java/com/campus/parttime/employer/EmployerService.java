package com.campus.parttime.employer;

import com.campus.parttime.common.Result;
import com.campus.parttime.entity.Employer;
import com.campus.parttime.entity.Job;

public interface EmployerService {
    Result<?> getProfile(Long userId);
    Result<?> updateProfile(Long userId, Employer employer);
    Result<?> getMyJobs(Long userId, int page, int size);
    Result<?> createJob(Long userId, Job job);
    Result<?> updateJob(Long userId, Long jobId, Job job);
    Result<?> closeJob(Long userId, Long jobId);
    Result<?> getApplicationsByJob(Long userId, Long jobId);
    Result<?> handleApplication(Long userId, Long applicationId, Integer status);
}