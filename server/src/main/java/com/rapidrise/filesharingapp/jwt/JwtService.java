package com.rapidrise.filesharingapp.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access.expiration}")
    private long accessExpiration;

    @Value("${jwt.refresh.expiration}")
    private long refreshExpiration;

    private Key key;

    @PostConstruct
    public void init() {
        key = Keys.hmacShaKeyFor(secret.getBytes());
    }

    // ACCESS TOKEN
    public String generateAccessToken(String email) {
        return buildToken(email, accessExpiration, "access");
    }

    // REFRESH TOKEN
    public String generateRefreshToken(String email) {
        return buildToken(email, refreshExpiration, "refresh");
    }

    public String generateShareAccessToken(
            String shareToken,
            String email
    ) {

        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(
                        new Date()
                )
                .setExpiration(
                        new Date(
                                System.currentTimeMillis()
                                        + (1000 * 60 * 5)
                        )
                )

                // custom claims
                .claim(
                        "type",
                        "share_access"
                )

                .claim(
                        "shareToken",
                        shareToken
                )

                .signWith(key)
                .compact();
    }

    public boolean isRefreshToken(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return "refresh".equals(claims.get("type"));
        } catch (JwtException e) {
            return false;
        }
    }

    public boolean isShareAccessToken(
            String token
    ) {

        try {

            Claims claims =
                    extractAllClaims(
                            token
                    );

            return "share_access"
                    .equals(
                            claims.get(
                                    "type"
                            )
                    );

        } catch (JwtException e) {

            return false;
        }
    }

    // COMMON TOKEN BUILDER
    private String buildToken(String email, long expiration, String type) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(
                        new Date(System.currentTimeMillis() + expiration)

                )
                .claim("type", type)
                .signWith(key)
                .compact();
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public Date extractExpiration(String token) {
        return extractAllClaims(token).getExpiration();
    }

    public String extractShareToken(
            String token
    ) {

        return extractAllClaims(token)
                .get(
                        "shareToken",
                        String.class
                );
    }

    public boolean isTokenValid(String token) {
        try {
            extractAllClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
