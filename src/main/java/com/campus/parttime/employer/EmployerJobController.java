package com.campus.parttime.employer;

import com.campus.parttime.common.Result;
import com.campus.parttime.entity.Employer;
import com.campus.parttime.entity.Job;
import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employer")
@RequiredArgsConstructor
public class EmployerJobController {

    private final EmployerService employerService;

    // 查企业信息
    @GetMapping("/profile")
    public Result getProfile(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return employerService.getProfile(userId);
    }

    // 更新企业信息
    @PutMapping("/profile")
    public Result updateProfile(@RequestBody Employer employer,
                                HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return employerService.updateProfile(userId, employer);
    }

    // 查自己发布的职位
    @GetMapping("/jobs")
    public Result getMyJobs(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return employerService.getMyJobs(userId, page, size);
    }

    // 发布职位（有认证检查）
    @PostMapping("/jobs")
    public Result createJob(@RequestBody Job job,
                            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return employerService.createJob(userId, job);
    }

    // 修改职位
    @PutMapping("/jobs/{id}")
    public Result updateJob(@PathVariable Long id,
                            @RequestBody Job job,
                            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return employerService.updateJob(userId, id, job);
    }

    // 下架职位
    @DeleteMapping("/jobs/{id}")
    public Result closeJob(@PathVariable Long id,
                           HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return employerService.closeJob(userId, id);
    }

    // 查某岗位的申请列表
    @GetMapping("/jobs/{id}/applications")
    public Result getApplications(@PathVariable Long id,
                                  HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return employerService.getApplicationsByJob(userId, id);
    }

    // 处理申请
    @PutMapping("/applications/{id}/handle")
    public Result handleApplication(@PathVariable Long id,
                                    @RequestBody java.util.Map<String, Integer> body,
                                    HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return employerService.handleApplication(userId, id, body.get("status"));
    }
}