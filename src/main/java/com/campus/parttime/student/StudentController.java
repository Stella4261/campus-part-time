package com.campus.parttime.student;

import com.campus.parttime.common.Result;
import com.campus.parttime.entity.Student;
import javax.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/student")
public class StudentController {

    @Autowired
    private StudentService studentService;

    /** 获取个人信息 */
    @GetMapping("/profile")
    public Result<?> getProfile(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return studentService.getProfile(userId);
    }

    /** 更新个人信息 */
    @PutMapping("/profile")
    public Result<?> updateProfile(@RequestBody Student student, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return studentService.updateProfile(userId, student);
    }

    /** 兼职大厅列表 */
    @GetMapping("/jobs")
    public Result<?> getJobList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer categoryId) {
        // 传入 status=1（招募中），只显示正在招聘的职位
        return studentService.getJobList(page, size, keyword, categoryId, 1);
    }

    /** 岗位详情 */
    @GetMapping("/jobs/{jobId}")
    public Result<?> getJobDetail(@PathVariable Long jobId) {
        return studentService.getJobDetail(jobId);
    }

    /** 投递简历 */
    @PostMapping("/applications")
    public Result<?> apply(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        Long jobId = Long.valueOf(body.get("jobId").toString());
        String coverLetter = (String) body.getOrDefault("coverLetter", "");
        return studentService.applyJob(userId, jobId, coverLetter);
    }

    /** 我的投递记录 */
    @GetMapping("/applications")
    public Result<?> getMyApplications(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return studentService.getMyApplications(userId);
    }

    /** 撤回投递 */
    @PutMapping("/applications/{applicationId}/cancel")
    public Result<?> cancelApplication(@PathVariable Long applicationId, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return studentService.cancelApplication(userId, applicationId);
    }
}