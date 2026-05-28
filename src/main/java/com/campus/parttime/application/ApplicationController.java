package com.campus.parttime.application;

import com.campus.parttime.common.Result;
import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    // 学生投递
    @PostMapping
    public Result apply(@RequestBody Map<String, Object> body,
                        HttpServletRequest request) {
        Long studentId = (Long) request.getAttribute("userId");
        return applicationService.apply(studentId, body);
    }

    // 学生查我的投递
    @GetMapping("/my")
    public Result getMyApplications(HttpServletRequest request) {
        Long studentId = (Long) request.getAttribute("userId");
        return applicationService.getMyApplications(studentId);
    }

    // 学生撤回
    @PutMapping("/{id}/withdraw")
    public Result withdraw(@PathVariable Long id,
                           HttpServletRequest request) {
        Long studentId = (Long) request.getAttribute("userId");
        return applicationService.withdraw(id, studentId);
    }

    // 企业查收到的申请
    @GetMapping("/received")
    public Result getReceived(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return applicationService.getReceived(userId);
    }

    // 企业处理申请
    @PutMapping("/{id}/handle")
    public Result handle(@PathVariable Long id,
                         @RequestBody Map<String, Integer> body) {
        return applicationService.handle(id, body.get("status"));
    }
}