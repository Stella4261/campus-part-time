package com.campus.parttime.student;

import com.campus.parttime.common.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;

@RestController
@RequestMapping("/api/jobs/public")
public class JobPublicController {

    @Autowired
    private StudentService studentService;

    @GetMapping
    public Result<Object> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Integer status) {

        Result<Object> result = (Result<Object>) studentService.getJobList(
                page, size, keyword, categoryId, status);
        if (result.getData() == null) {
            result.setData(new ArrayList<>());
        }
        return result;
    }

    @GetMapping("/{id}")
    public Result<Object> detail(@PathVariable Long id) {
        Result<Object> result = (Result<Object>) studentService.getJobDetail(id);

        // 确保 data 不是 null
        if (result.getData() == null) {
            result.setData(new HashMap<>());
        }
        return result;
    }
}