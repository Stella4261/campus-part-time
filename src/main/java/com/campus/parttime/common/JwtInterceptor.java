package com.campus.parttime.common;

import io.jsonwebtoken.Claims;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class JwtInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // OPTIONS预检请求直接放行
        if ("OPTIONS".equals(request.getMethod())) {
            return true;
        }

        //从Authorization请求获取token
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setStatus(401);
            response.getWriter().write("{\"code\":401,\"message\":\"未登录\"}");
            return false;
        }

        String token = authHeader.substring(7);//去掉Bearer
        //验证token
        if (!jwtUtil.validateToken(token)) {
            response.setStatus(401);
            response.getWriter().write("{\"code\":401,\"message\":\"token无效或已过期\"}");
            return false;
        }
        Claims claims = jwtUtil.parseToken(token);
        request.setAttribute("userId", claims.get("userId", Long.class));
        request.setAttribute("role", claims.get("role", Integer.class));
        return true;
    }
}