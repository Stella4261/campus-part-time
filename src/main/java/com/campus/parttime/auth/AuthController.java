package com.campus.parttime.auth;

import com.campus.parttime.common.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public Result<?> login(@RequestBody LoginRequest req) {
        return authService.login(req);
    }

    @PostMapping("/register")
    public Result<?> register(@RequestBody RegisterRequest req) {
        return authService.register(req);
    }
}