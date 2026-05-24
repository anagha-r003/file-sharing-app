package com.rapidrise.filesharingapp.jwt;

import com.rapidrise.filesharingapp.dto.ResponseStructure;
import com.rapidrise.filesharingapp.exception.*;
import com.rapidrise.filesharingapp.repository.UserRepository;
import com.rapidrise.filesharingapp.util.ResponseBuilder;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import tools.jackson.databind.ObjectMapper;
import io.jsonwebtoken.security.SignatureException;

import java.io.IOException;
import java.util.List;


@Component
@RequiredArgsConstructor
@Slf4j
public class JwtFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest req,
            HttpServletResponse res,
            FilterChain chain
    ) throws ServletException, IOException {

        String path =
                req.getServletPath();

        if (path.startsWith("/share/view/")
                || path.startsWith("/share/download/")
                || path.startsWith("/share/request-otp")
                || path.startsWith("/share/verify-otp")

        ) {

            chain.doFilter(
                    req,
                    res
            );

            return;
        }

        try {
            String header = req.getHeader("Authorization");

            // Allow public APIs
            if (header == null || !header.startsWith("Bearer ")) {
                chain.doFilter(req, res);
                return;
            }

            String token = header.substring(7);

            if (token.isBlank()) {
                throw new MissingAuthorizationHeaderException(
                        "Bearer token is missing"
                );
            }

            String email;
            try {
                email = jwtService.extractUsername(token);
            } catch (ExpiredJwtException e) {
                throw new TokenExpiredException("Token expired");
            } catch (MalformedJwtException |
                     SignatureException |
                     UnsupportedJwtException |
                     IllegalArgumentException e) {
                throw new InvalidTokenException("Invalid JWT token");
            } catch (Exception e) {
                throw new TokenParsingException(
                        "Failed to parse token"
                );
            }

            if (email == null || email.isBlank()) {
                throw new InvalidTokenException(
                        "Invalid JWT token"
                );
            }

            if (SecurityContextHolder.getContext()
                    .getAuthentication() == null) {

                var user = userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new UserNotFoundException(
                                        "User not found"
                                ));

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                                user,
                                null,
                                List.of()
                        );

                SecurityContextHolder.getContext()
                        .setAuthentication(auth);
            }

            chain.doFilter(req, res);

        } catch (MissingAuthorizationHeaderException |
                 TokenExpiredException |
                 InvalidTokenException |
                 TokenParsingException |
                 UserNotFoundException e) {

            sendErrorResponse(res, e.getMessage());

        } catch (Exception e) {
            log.error("JWT Filter Error: {}", e.getMessage(), e); // ← add e here
            sendErrorResponse(
                    res,
                    "Authentication failed"
            );
        }
    }

    private void sendErrorResponse(
            HttpServletResponse res,
            String message
    ) throws IOException {

        log.error("JWT Filter Error: {}", message);

        res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        res.setContentType("application/json");

        ResponseStructure<Object> response =
                ResponseBuilder.buildBody(
                        HttpStatus.UNAUTHORIZED,
                        message,
                        null
                );

        new ObjectMapper().writeValue(res.getWriter(), response);
    }

    @Override
    protected boolean shouldNotFilter(
            HttpServletRequest request
    ) {
        return request.getServletPath()
                .startsWith("/auth");
    }
}
