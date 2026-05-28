package com.campus.parttime.common;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expire}")
    private int expireDays;

    private Key getKey() {
        return Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );
    }

    //生成token（携带userId和role）
    public String generateToken(Long userId, Integer role) {

        return Jwts.builder()
                .claim("userId", userId)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(
                        new Date(
                                System.currentTimeMillis()
                                        + (long) expireDays
                                        * 24 * 60 * 60 * 1000
                        )
                )
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    //解析token
    public Claims parseToken(String token) {

        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    //验证token
    public boolean validateToken(String token) {

        try {
            parseToken(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}